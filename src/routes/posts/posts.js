const { Router } = require('express');
const { getCurrentLocation } = require('../../util/geo-location')
const { isLoggedIn } = require('../../util/auth');
const { catchAsync } = require('../../middleware/errors');
const Post = require('../../models/post');
const { CustomHttpError, Unauthorized } = require('../../errors');
const { BadRequest } = require('../../errors');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../../../image-uploads/');
    },
    filename: (req, file, cb) =>{
        cb(null, new Date().toISOString() + file.originalname)
    }
});
const upload = multer({storage: storage});

const router = Router();

router.get('/', catchAsync(async (req, res) => {

}));

router.get('/:postId', catchAsync(async (req, res) => {
    if (!isLoggedIn(req)){
        res.status(403).json({ message: 'not authorized' });
    }else{   
        const id = req.params.postId; 
        res.status(200).json(await Post.findById(id));
    }    
}));

router.put('/:postId', catchAsync(async (req, res) => {
    if (!isLoggedIn(req)){
        res.status(403).json({ message: 'not authorized' });
    }else{   
        const postId = req.params.postId;
        const updateOps = {};
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }
        res.status(200).json(await Post.update({id = postId}, { $set: updateOps}));
    }
    })
);

router.post('/', upload.single('postImage'),catchAsync(async (req, res) => {
    if (!isLoggedIn(req)){
        res.status(403).json({ message: 'not authorized' });
    }else{   
        var imgUrl = imgFolderPath + req.body.imagePath;
        const post = new Post({
            createdById: req.body.userId,
            imageUrl: imgUrl,
            location: getCurrentLocation,
            description: req.body.description,
            isPublic: req.body.isPublic
        });
        res.status(201).json(await Post.create(post));
    }
    }) 
);