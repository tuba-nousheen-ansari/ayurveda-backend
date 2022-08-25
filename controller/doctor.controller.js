const doctorM = require("../model/doctor.model");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Storage } = require("@google-cloud/storage");
const requests = require("request");
const jwt = require("jsonwebtoken");

const csv = require("csvtojson");

require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

let storedObj;
let bucketName = "gs://app-project-ayurveda2.appspot.com";

const storage = new Storage({
    keyFilename: "serviceFirebaseStorage.json",
});
const uploadFile = async(filename) => {
    await storage.bucket(bucketName).upload(filename, {
        gzip: true,
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: "image",
            },
        },
    });

    console.log(`${filename} uploaded to ${bucketName}.`);
};

exports.addDoctor = (request, response) => {
    let randomNumber = Math.floor(100000 + Math.random() * 900000);
    let m = request.body.mobile;
    let name = request.body.name;
    let password = request.body.password;
    let image =
        "https://firebasestorage.googleapis.com/v0/b/app-project-ayurveda2.appspot.com/o/" +
        request.file.filename +
        "?alt=media&token=image";
    bcrypt
        .hash(password, 10)
        .then((encpass) => {
            doctorM
                .create({
                    name: name,
                    email: request.body.email,
                    password: encpass,
                    mobile: m,
                    image: image,
                    experience: request.body.experience,
                    degree: request.body.degree,
                    category: request.body.category,
                    otp: randomNumber,
                    gender: request.body.gender,
                    clinicName: request.body.clinicName,
                    clinicAddress: request.body.clinicAddress,
                    clinicNo: request.body.clinicNo,
                    clinicTiming: request.body.clinicTiming,
                    speciality: request.body.speciality,
                })
                .then((result) => {
                    uploadFile(
                        path.join(__dirname, "../", "public/images/") +
                        request.file.filename
                    );
                    return response.status(201).json(result);
                })
                .catch((err) => {
                    console.log(err);
                    return response.status(500).json({ error: "Cannot Added" });
                });
            client.messages
                .create({
                    body: "Hello " +
                        name +
                        " your otp for The Great Ayurveda is" +
                        " " +
                        randomNumber,
                    from: +12057821193,
                    to: +91 + m,
                })
                .then((message) => console.log(message.sid))
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.verify = (request, response) => {
    console.log(request.body);
    doctorM
        .updateOne({ _id: request.body.id, otp: request.body.otp }, { $set: { isverfied: true } })
        .then((result) => {
            if (result.matchedCount && result.modifiedCount) {
                return response
                    .status(201)
                    .json({ result: result, message: "SignUp Success" });
            } else {
                return response
                    .status(403)
                    .json({ result: result, Error: "Please Enter valid otp" });
            }
        })
        .catch((err) => {
            console.log(err);
            return response.status(201).json({ error: err });
        });
};

exports.review = async(request, response) => {
    let uId = request.body.uId;
    let dId = request.body.dId;
    let reviewText = request.body.reviewText;

    let review = await doctorM.findOne({ _id: dId });
    let reviewdetailsobj = {
        uId: uId,
        reviewText: reviewText,
    };
    review.reviewerDetail.push(reviewdetailsobj);
    review
        .save()
        .then((result) => {
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ error: "Cannot Review" });
        });
};

exports.viewAllDoctor = (request, response) => {
    doctorM
        .find()
        .then((result) => {
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Not found" });
        });
};

exports.viewOneDoctor = (request, response) => {
    doctorM
        .findOne({ _id: request.body.doctorId })
        .populate({ path: "reviewerDetail.uId" })
        .then((result) => {
            console.log(result);
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Not found" });
        });
};

exports.viewBySearch = (request, response) => {
    doctorM
        .find({ speciality: { $regex: request.body.speciality, $options: "i" } })
        .then((result) => {
            console.log(result);
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Not found" });
        });
};

exports.viewByCat = (request, response) => {
    doctorM
        .findOne({ category: request.body.catId })
        .then((result) => {
            console.log(result);
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "not found" });
        });
};

exports.deleteDoctor = (request, response) => {
    doctorM
        .deleteOne({ _id: request.body.id })
        .then((result) => {
            if (result.deletedCount)
                return response.status(200).json({ message: "delete succcess" });
            else return response.status(400).json({ message: "not deleted" });
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Error" });
        });
};

exports.updateDoctor = (request, response) => {
    let image;
    if (request.file) {
        image =

            "https://firebasestorage.googleapis.com/v0/b/app-project-ayurveda2.appspot.com/o/" +

            request.file.filename +
            "?alt=media&token=image";

        uploadFile(
            path.join(__dirname, "../", "public/images/") + request.file.filename
        );
        requests({
            url: request.body.oldImage,
            qs: {
                key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCtcKpBScZjc/C0\n55KkzANwzFulQNu+6946RHiZ9/nj1WeYlaqytpOoGoSvkwmhwxaEAdEGo3PbRTNd\nl9ri3HtaeKJQDifdYRUBhJzubtQP1furB+qOP89YAecZ+Gq+ZrNp2m9K5MO12MP+\n3wlN4HDXGhZTuaOcIWUP17HDl7ntadIPPd+sFJwNNJRSvvh2/AfpJnECi2o6ZAsk\nrMlv8WD4E7EHce2ecNgxCOPylraRWTX9ziPAPM5mRDlhoXvmrsGub98DqsEL0OeZ\nXpNAhbDoJ5nUMF3G5tOYmL0Cs+00cIBybQRgULzEGtI/sdlB2NRoaWNq4tcrxRPy\nCdjVruzHAgMBAAECggEAIt+gBC+q2c1yrVVQyZ0R5gjZNpGjfbCchvfEjiTr1JFQ\n2r/hSjzm1Kq8WjdE/QcmjFV3K5ALGCBCc0O46duuW+Mcs98cyeke2abKDTEwp5x9\nlYaqdX7EGKyNRM4L3Iv28EZREWyNI4/Z3PIIw2VpGv8uVRhjGt4mHXjfz/W+l0tV\n1wVb/lPB2oaDICl5QMKxD89MzLrkjh1FtcymWLX6fN9Amhg3beiDuRKTCjuPvsVZ\n+kPvHm6I2moyFtuSbHypRYk9wFiOwODCzcAkh4HUipYriDwF2QlV8YgTXJ8C11Lb\npkOBlzH5Vjlla6NVa4NGWorRG5oZZPdZau8f4R/9RQKBgQDvk2BaSNhGZh1aWt1I\n3Nymmqbx9xyFx3uhVjzIWsTyfa97kxZAQGi6Ca97gBBKlYPwjvlzz2I1cEHOa4xv\n7ghhxV9qKkxEU81JvKmC2CS0e/9cM6dVRaXaMX9Avpp9p+aAvnoIwRlhA4ekLHLC\n6p76575PSWMCibAFWL7aXKOaQwKBgQC5VJbztdMuoMKW7GD7veiFhMUrVTkc3WkL\nEahoaH/lYl/74qsfqfkglJTwpPwheXnGUceEmggKo604a7W7b29aKncX/HBKRxgW\n2Ak+7EMbNM4vL1etXJnh7X7bnDQZoFdQbf+/0lFe4Et2Ut/zrRb7DAZiA/dYjSAc\n/5rN0piFLQKBgBTb1gXGVd47Qc7+HkobwLJYwLRMeZVEOwVfBsfC72bVfpPZyJQr\nh3K7KSYtjj2QKv6k1B87LSfN8EzSnFWaeexZTOdna2B/k14aKQAVZYy5RxB2Btmr\nyLbonFW8wqKyHaWT7/gXJ+iEcCjhHdTOrKzXxIAOuaoc5tBwW52Td0MVAoGAOFzE\nZ6vFZOnZJAMRX54ax/hf6lTJwMCJQKeHGvGk68LmQ/lkZ4XO0Ry+ywyx7RA/e5PF\nZMtfZLTwajc/lphGOhquC2pnT/+dEN10umEp6208w1bXiE6gMfiDWxB/O8fqpfg+\nDj1NJ9h4uqxrlXTvhzvZ+RcRsymAObF2h9/jKKUCgYB1pwW/O+BaDPdai7eZjr/I\nFq5kc9r9O1ljGicIurCG1oBiETZedufPz2PhQwyfT1A2Fq9OqthEpvJitsC7aVO+\nUXBo22m8Gd3Q7C4PVHTgi2PBFyUJ74g9/qG86Gx10311XkWWkLV6ZjHyX1dJURHn\nOxo5Tux8+kYtfaCPopmQcg==\n-----END PRIVATE KEY-----\n",
            }, // you can find your private-key in your keyfile.json
            method: "DELETE",
        });
    } else {
        image = request.body.oldImage;
    }
    doctorM
        .updateOne({ _id: request.body.id }, {
            $set: {
                name: request.body.name,
                email: request.body.email,

                password: request.body.password,
                mobile: request.body.mobile,
                exprience: request.body.exprience,
                degree: request.body.degree,
                category: request.body.category,
                otp: request.body.otp,

                clinicName: request.body.clinicName,
                clinicAddress: request.body.clinicAddress,
                clinicNo: request.body.clinicNo,
                clinicTiming: request.body.clinicTiming,
            },
        })
        .then((result) => {

            if (result.modifiedCount)
                return response.status(200).json(result);
            else
                return response.status(201).json({ message: "not update" });

        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json(err);
        });
};

exports.ViewReviewByDid = (request, response) => {
    doctorM
        .findOne({ _id: request.body.dId })
        .populate({ path: "reviewerDetail.uId" })
        .then((result) => {



            return response.status(200).json(result);
        })
        .catch((err) => {
            return response.status(500).json(err);
        });
};


exports.ViewReview = (request, response) => {
    doctorM.find().populate('reviewerDetail.uId')
        .then((result) => {
            return response.status(200).json(result);
        })
        .catch((err) => {
            return response.status(500).json(err);
        });
}

exports.signin = (request, response) => {
    var email = request.body.email;
    var p = request.body.password;

    doctorM
        .findOne({ email: email })
        .then((result) => {
            if (result.isApproved == true) {
                const encpass = result.password;
                bcrypt.compare(p, encpass, function(err, res) {
                    if (result.isverfied && res) {
                        const payload = { subject: result._id };
                        const token = jwt.sign(payload, "dhdbsjcdsncjdsfjdsjkfskjdsfr");
                        return response.status(200).json({
                            result: result,
                            token: token,
                        });
                    } else {
                        return response.status(201).json({ error: "Invalid User" });
                    }
                });
            } else {
                return response.status(201).json({ message: "not approved" });
            }
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "error" });
        });
};

exports.RemoveReview = async(request, response) => {
    let uId = request.body.uId;
    // console.log(request.body.uId+" "+request.body.dId);
    let doctor = await doctorM.findOne({ _id: request.body.dId });
    doctor.reviewerDetail.pull({ _id: uId });
    doctor
        .save()
        .then((result) => {})
        .catch((err) => {
            console.log(err);
        });
};

exports.ExcelUpload = (request, response) => {
    const filePath = "doctorExcel.csv";
    csv()
        .fromFile(filePath)
        .then((jsonObj) => {
            storedObj = jsonObj;
            doctorM
                .create(storedObj)
                .then((result) => {
                    return response.status(201).json(result);
                })
                .catch((err) => {
                    console.log(err);
                    return response
                        .status(500)
                        .json({ error: "Cannot Upload ExcelSheet" });
                });
        });
};

exports.ApproveDoctor = (request, response) => {
    let doctorId = request.body.doctorId;
    doctorM
        .updateOne({ _id: doctorId }, { isApproved: true })
        .then((result) => {
            return response.status(201).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(201).json(result);
        });
};

exports.RejectDoctor = (request, response) => {
    let doctorId = request.body.doctorId;
    doctorM
        .deleteOne({ _id: doctorId })
        .then((result) => {
            return response.status(201).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(201).json(result);
        });

};
exports.Remove = (request, response) => {
    console.log(request.body);
    doctorM
        .deleteOne({ _id: request.body.id })
        .then((result) => {
            return response.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).json({ message: "Account Not Removed" });
        });

};