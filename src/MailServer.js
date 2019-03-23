'use strict';
const nodemailer = require('nodemailer');

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
    subject: 'Alert : Call Generated', // Subject line
    text: 'Alert for', // plain text body
    html: '<p><b>Hello</b> Alert triggered on Wed Nov 7, 6:00 pm</p>' +
        '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@example.com"/></p>',

    // An array of attachments
   /*  attachments: [
    // String attachment
    {
        filename: 'notes.txt',
        content: 'Some notes about this e-mail',
        contentType: 'text/plain' // optional, would be detected from the filename
    }
    ], */

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

function sendingMail(toEmail, strategy, symbolsList){
    //console.log("sendingMail> " + toEmail +" : "+ strategy +" :: "+symbolsList);
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
        //console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}