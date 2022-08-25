const express = require("express");
const diseaseController = require("../controller/disease.controller");
const diseaseRouter = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "public/images",
  filename: (request, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });
diseaseRouter.post(
  "/add-disease",
  upload.single("image"),
  diseaseController.Add
);
diseaseRouter.post("/review", diseaseController.Review);
diseaseRouter.post("/medicines", diseaseController.MedicineAdd);
diseaseRouter.post("/remove", diseaseController.Delete);
diseaseRouter.get("/viewall", diseaseController.ViewAll);
diseaseRouter.post("/update", upload.single("image"), diseaseController.Update);
diseaseRouter.post(
  "/view-particularDisease",
  diseaseController.ViewParticularDisease
);
diseaseRouter.post("/search-disease", diseaseController.Search);
diseaseRouter.post("/delete-medicine", diseaseController.deleteOneMedicine);
diseaseRouter.post("/excel", diseaseController.ExcelUpload);
module.exports = diseaseRouter;
