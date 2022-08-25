const queryM = require("../model/query.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "databaseayurveda0007@gmail.com",
    pass: "mydatabase123",
  },
});

exports.SendQuery = (request, response) => {
  const mailOptions = {
    from: "databaseayurveda0007@gmail.com",
    to: request.body.email,
    subject: "Query Related",
    text: "Dear user, we have received your query soon we will work on it, thank you:The Great Ayurveda",
  };
  queryM
    .create({ email: request.body.email, query: request.body.query })
    .then((result) => {
      console.log(result)
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(info.response);
        }
      });
      return response.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).json({ error: "Not getting data" });
    });
};

exports.Resolve = (request, response) => {
  let textSend=request.body.textSend;

  const mailOptions = {
    from: "databaseayurveda0007@gmail.com",
    to: request.body.email,
    subject: "Query Related",
    text: "Dear user, "+textSend+" thank you:The Great Ayurveda",
  };
  queryM
    .updateOne({ _id: request.body.id }, { $set: { status: "Resolved" } })
    .then((result) => {
      if (result.modifiedCount && result.matchedCount) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log(info.response);
          }
        });
        return response.status(200).json(result);

      }
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).json({ error: "Not Resolved" });
    });
};

exports.Check = (request, response) => {

  queryM
    .findOne({ _id: request.body.id })
    .then((result) => {
      console.log(result);
      console.log(result.status);
      if (result.status == "Resolved") {
        console.log("inside if");
        return response.status(200).json(result);
      } else {
        return response.status(404).json({ message: "Query not resolved" });
      }
    })
    .catch((err) => {
      console.log(err);
      return response.status(500).json({ error: "Not Resolved" });
    });
};

exports.ViewOne = (request, response) => {
  queryM.findOne({_id:request.body.id}).then(result => {
    return response.status(200).json(result);

  }).catch(err => {
    console.log(err);
    return response.status(500).json({ error: 'Cannot Fetch data' });
  })
};

exports.View = (request, response) => {
  queryM.find().then(result => {
    return response.status(200).json(result);

  }).catch(err => {
    console.log(err);
    return response.status(500).json({ error: 'Cannot Fetch data' });
  })
};
