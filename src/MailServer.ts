'use strict';
const nodemailer = require('nodemailer');

/* const transporter = nodemailer.createTransport({
host: 'smtp.ethereal.email',
port: 587,
auth: {
    user: 'zjpmrzusjzh7sh3d@ethereal.email',
    pass: 'Bd9q3YhYdhVftEUHmK'
}
}); */


var transporter = nodemailer.createTransport({
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
    subject: 'Call Generated', // Subject line
    text: 'Hello world?', // plain text body
    html: '<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>' +
        '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>',

    // An array of attachments
    attachments: [
    // String attachment
    {
        filename: 'notes.txt',
        content: 'Some notes about this e-mail',
        contentType: 'text/plain' // optional, would be detected from the filename
    },

    // Binary Buffer attachment
    /* {
        filename: 'image.png',
        content: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
                '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
                'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
            'base64'
        ),

        cid: 'note@example.com' // should be as unique as possible
    },

    // File Stream attachment
    {
        filename: 'nyan cat ✔.gif',
        path: __dirname + '/image/logo.png',
        cid: 'nyan@example.com' // should be as unique as possible
    } */
    ],

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


function sendingMail(){
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}