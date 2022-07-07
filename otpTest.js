require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const router = require('express').Router();
const Database = require('./database');
const jwt = require('jsonwebtoken');
const sendGridTransport = require('@sendgrid/mail');
const jwtAuthToken = process.env.ACCESS_TOKEN_SECRET;
const jwtRefreshToken = process.env.JWT_REFRESH_TOKEN;
const smsKey = process.env.SMS_SECRET_KEY;

router.post('/get-mobile-number-by-employeeId', async (req, res) => {
  try {
    const data = await (await Database.DB.query(`select phone_number from employee where employeeId = ${req.body.number}`)).rows;
    data.length > 0 ? res.send({ msg: 'mobile number exists', number: data }).end() : res.send({ msg: 'mobile number not found' }).end();
  } catch (error) {
    console.log(error);
  }
});

router.post('/otp-date-exists', async (req, res) => {
  try {
    const { date, phone } = req.body.obj;
    const mobileNumber = phone.slice(2);
    const serverDate = await (await Database.DB.query(`select last_otp_login_date,hash_code from employee where phone_number = ${mobileNumber}`)).rows;
    if (new Date(date).toLocaleDateString('en-CA') === new Date(serverDate[0].last_otp_login_date).toLocaleDateString('en-CA')) {
      res.send({ msg: 'otp already send', data: serverDate });
    } else {
      res.send({ msg: 'otp not exists', mobile: mobileNumber });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    // console.log('otp');
    const phone = req.body.mobileNumber;
    const name = await await (await Database.DB.query(`select first_name,email from employee where phone_number = ${phone.slice(2)}`)).rows;
    // console.log(name);
    const otp = Math.floor(1000 + Math.random() * 9000);
    // const ttl = 60 * 60 * 1000;
    // const expires = Date.now() + ttl;
    const expires = new Date();
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
    sendGridTransport.setApiKey(process.env.SEND_GRID_TOKEN);

    let options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };

    // await axios.post(`https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=${process.env.SMS_GATEWAY_HUB_KEY}&senderid=LMVITS&channel=2&DCS=0&flashsms=0&number=${phone}&text=Dear ${name[0].first_name}, ${otp} is the OTP for your login at LMV Payroll. In case of dispute call us +919100777950.&route=39&dlttemplateid=1307163817134548413`).then(async (response) => {
    //   if (response.status === 200) {
    //     const message = {
    //       from: 'lmvitsolutions@lmvit.com',
    //       to: `${name[0].email}`,
    //       subject: 'OTP Verification',
    //       html: `
    //               <h3>Dear, ${name[0].first_name}</h3>

    //               <p>Please verify your login by entering below OTP valid for ${new Date().toDateString('en-GB', { options })}.</p>
    //               <P><b>OTP: </b>${otp}</P>

    //               <p>Regards,</p>
    //               <p>LMV IT SOLUTIONS PVT LTD.</p>
    //                   `,
    //     };
    //     sendGridTransport.send(message).then((resp) => {
    //       if (resp[0].statusCode === 202) {
    //         res.send({ phone, hash: fullHash }).end();
    //       }
    //     });
    //   }
    // });
    // testing
    console.log('otp', otp);
    res.send({ phone, hash: fullHash, otp }).end();
  } catch (error) {
    console.log(error);
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const phone = req.body.obj.phone;
    const hash = req.body.obj.hash;
    const otp = req.body.obj.otp;
    let [hashValue, expires] = hash.split('.');
    const employeeId = await (await Database.DB.query(`select employeeid from employee where phone_number = ${req.body.obj.phone.slice(2)}`)).rows;
    const user = { employee_id: employeeId[0].employeeid };
    // let now = Date.now();
    let now = new Date();
    if (now > parseInt(expires)) {
      return res.status(504).send({ message: 'Timeout Please try again' });
    }
    const data = `${phone}.${otp}.${expires}`;
    const newHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
    if (newHash === hashValue) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      const data = await (await Database.DB.query(`update employee set last_otp_login_date = '${new Date().toLocaleDateString('en-CA')}', hash_code = '${hash}' where employeeid =${employeeId[0].employeeid}`)).rowCount;
      return res.status(200).send({ message: 'Success', accessToken: accessToken });
    } else {
      return res.status(200).send({ verification: false, message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
