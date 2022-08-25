const { request, response } = require("express");
const appointmentM = require("../model/appointment.model");
const userM = require("../model/user.model");
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

exports.BookAppointment = (request, response) => {
    let patientName = request.body.patientName;
    let age = request.body.age;
    let disease = request.body.disease;
    let mobile = request.body.mobile;
    let userId = request.body.userId;
    let doctorId = request.body.doctorId;
    let currentDate = request.body.date;
    // let date = new Date();
    // let b = date.getDate();
    // let c = date.getMonth() + 1;
    // let d = date.getFullYear();
    // let currentDate = b + '/' + c + '/' + d
    // console.log(currentDate);

    appointmentM
        .create({
            patientName: patientName,
            age: age,
            disease: disease,
            mobile: mobile,
            userId: userId,
            doctor: doctorId,
            date: currentDate,
        })
        .then((result1) => {
            console.log(result1);
            client.messages
                .create({
                    body: "Hello " +
                        patientName +
                        " your request for appointment has been The Great Ayurveda team will soon contact you " +
                        currentDate,
                    from: +12057821193,
                    to: +91 + mobile,
                })

            .then((message) => console.log(message.sid))
                .catch((err) => {
                    console.log(err);
                });
            return response.status(200).json(result1);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "something went wrong" });
        });
};
exports.viewAppointmentByUid = (request, response) => {
    appointmentM
        .find({ userId: request.body.uId }).populate('doctor')
        .then((result) => {
            console.log(result);
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Error...." });
        });
};

exports.DoctorResponseAccept = (request, response) => {
    appointmentM
        .updateOne({ _id: request.body.aId }, { $set: { apointmentStatus: "Accepted" } })
        .then((result) => {
            if (result.modifiedCount && result.matchedCount) {
                return response
                    .status(200)
                    .json({ result: result, message: "Appointment accepted" });
            } else {
                return response
                    .status(404)
                    .json({ result: result, message: "Appointment not accepted" });
            }
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ error: "Not Updated" });
        });
};
exports.DoctorResponseReject = (request, response) => {
    appointmentM
        .updateOne({ _id: request.body.aId }, { $set: { apointmentStatus: "Rejected" } })
        .then((result) => {
            if (result.modifiedCount && result.matchedCount) {
                return response
                    .status(200)
                    .json({ result: result, message: "Appointment Rejected" });
            } else {
                return response
                    .status(404)
                    .json({ result: result, message: "Appointment not rejected" });
            }
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ error: "Not Updated" });
        });
};

//tanu
exports.viewAppointmentByDid = (request, response) => {
    console.log(request.body)
    var temp = [];
    var k = 0;
    var status = false;
    appointmentM
        .find({ doctor: request.body.dId })
        .then((result) => {
            for (var i = 0; i < result.length; i++) {
                if (result[i].apointmentStatus == "Accepted") {
                    temp[k++] = result[i];
                    status = true;
                }
            }
            console.log(temp);
            return response.status(200).json(temp);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Error...." });
        });
};

exports.viewAppointmentByDidPending = (request, response) => {
    console.log(request.body)
    var temp = [];
    var k = 0;
    var status = false;
    appointmentM
        .find({ doctor: request.body.dId })
        .then((result) => {
            console.log(result)
            for (var i = 0; i < result.length; i++) {
                if (result[i].apointmentStatus == "pending") {
                    temp[k++] = result[i];
                }
            }
            console.log(temp);
            return response.status(200).json(temp);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Error...." });
        });
};

exports.ViewAppointment = (request, response) => {
    appointmentM
        .find()
        .then((result) => {
            return response.status(201).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ error: "Cannot fetch data" });
        });
};

exports.acceptAppointment = (request, response) => {
    console.log(request.body);
    time = request.body.time;
    date = request.body.date;
    uId = request.body.uId;
    mobile = request.body.mobile;
    console.log(mobile, time, date, uId);
    userM
        .findOne({ _id: uId })
        .then((resultuser) => {
            appointmentM
                .updateOne({ _id: request.body.aId }, { $set: { apointmentStatus: "Accepted" } })
                .then((result) => {
                    console.log(result);
                    if (result.modifiedCount) {
                        client.messages
                            .create({
                                body: "Hello " +
                                    resultuser.name +
                                    " your appointment date:" +
                                    date +
                                    "and time:" +
                                    time +
                                    "soon later..",
                                from: +12057821193,
                                to: +91 + mobile,
                            })

                        .then((message) => console.log(message.sid))
                            .catch((err) => {
                                console.log(err);
                            });
                        return response.status(200).json(result);
                    } else return response.status(201).json({ message: "not booked" });
                })
                .catch((err) => {
                    console.log(err);
                    return response.status(500).json({ message: "error" });
                });
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "error" });
        });
};
exports.cancleApppoinment = (request, response) => {
    uId = request.body.uId;
    mobile = request.body.mobile;
    userM
        .findOne({ _id: uId })
        .then((resultuser) => {
            appointmentM
                .deleteOne({ _id: request.body.aId })
                .then((result) => {
                    console.log(result);
                    if (result.deletedCount) {
                        client.messages
                            .create({
                                body: "Hello " + resultuser.name + " sorry I am not accepted your ",
                                from: +12057821193,
                                to: +91 + mobile,
                            })

                        .then((message) => console.log(message.sid))
                            .catch((err) => {
                                console.log(err);
                            });
                        return response.status(200).json(result);
                    } else return response.status(201).json({ message: "not deleted" });
                })
                .catch((err) => {
                    console.log(err);
                    return response.status(500).json({ message: "error..." });
                });
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "error" });
        });
};