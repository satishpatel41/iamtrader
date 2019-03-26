/* 'use strict';
const nodemailer = require('nodemailer');

var transporter1 = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: 'satish.patel41@gmail.com',
    pass: 'Pratiksha@123'
}
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Admin" <satish.patel41@gmail.com>', // sender address
    to: 'satish.patel41@yahoo.com', // list of receivers
    subject: 'Alert : Call Generated', // Subject line
    text: 'Alert for', // plain text body
    html: '<p><b>Hello</b> Alert triggered on Wed Nov 7, 6:00 pm</p>' +
        '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>',

    list: {
        // List-Help: <mailto:admin@example.com?subject=help>
        help: 'admin@example.com?subject=help',
        // List-Unsubscribe: <http://example.com> (Comment)
        unsubscribe: [
            {
                url: 'http://example.com/unsubscribe',
                comment: 'A short note about this url'
            },
            'unsubscribe@example.com'
        ],
        // List-ID: "comment" <example.com>
        id: {
            url: 'mylist.example.com',
            comment: 'This is my awesome list'
        }
    }
};


var transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'tito25@ethereal.email',
        pass: 'cXqDHqccV9T7VMqhzs'
    }
});

function sendingMail(toEmail, strategy, symbolsList){
    console.log("sendingMail> " + toEmail +" : "+ strategy +" :: "+symbolsList);
    var list = "<ul>";
    symbolsList.map(symbol =>
    {
        list+="<li>"+symbol+"</li>";
    });
    list+="</ul>";
   
    var india = moment.tz(new Date(), "Asia/Kolkata");
    india.format(); 
    var now = india.date() +"/"+(india.month() + 1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.timestamp);
    

    mailOptions.subject = 'Scan alert ' + strategy, // Subject line
    mailOptions.to = toEmail;
    mailOptions.html =  "<h1>Alert triggered on " +now+"</h1><br><p>Below is the list of new stocks filtered through scan <u>" +strategy+"</u></p><br><p><b>" + list+"</b></p>";
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
} */

"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper

async  function sendingMail(toEmail, strategy, symbolsList){

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let account = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass // generated ethereal password
    }
  });
  console.log('nodemailer user  : ' +  account.user +" \n "+ account.pass);

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>" // html body
  };

  var list = "<ul>";
  symbolsList.map(symbol =>
  {
      list+="<li>"+symbol+"</li>";
  });
  list+="</ul>";
 
  var india = moment.tz(new Date(), "Asia/Kolkata");
  india.format(); 
  var now = india.date() +"/"+(india.month() + 1) +"/"+india.year()+" "+india.hour()+":"+india.minute();//new Date(row.timestamp);
  

  mailOptions.subject = 'Scan alert ' + strategy, // Subject line
  mailOptions.to = toEmail;
  mailOptions.html =  "<h1>Alert triggered on " +now+"</h1><br><p>Below is the list of new stocks filtered through scan <u>" +strategy+"</u></p><br><p><b>" + list+"</b></p>";
 

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

