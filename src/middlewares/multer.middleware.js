import multer from 'multer';
/*
--> 'multer' documentation,
--> link: https://github.com/expressjs/multer/blob/master/README.md
*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
})
  
const upload = multer({
    storage,
});

export default upload

