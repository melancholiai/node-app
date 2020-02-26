const { Router } = require('express');
const { getCurrentLocation } = require('../../util/geo-location')
const { isLoggedIn } = require('../../util/auth');
const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const Post = require('../../models/post');
const Filter = require('../../models/filter');
const { CustomHttpError, Unauthorized } = require('../../errors');
const { BadRequest } = require('../../errors');

const { newPostSchema } = require('../../joi-schemas/post-schema');
const { coordinatesSchema } = require('../../joi-schemas/utils');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../../../image-uploads/');
    },
    filename: (req, file, cb) =>{
        cb(null, new Date().toISOString() + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10},
    fileFilter: fileFilter
});

const router = Router();

router.get('/', catchAsync(async (req, res) => {
    const filter = new Filter({
        distance: req.body.radius
    });
    res.status(200).json(
        await Post.find().where());
}));

router.get('/:postId', auth, catchAsync(async (req, res) => {
        const id = req.params.postId; 
        res.status(200).json(await Post.findById(id));
    }   
));

router.put('/:postId', auth, catchAsync(async (req, res) => {
        const postId = req.params.postId;
        const updateOps = {};
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }
        res.status(200).json(await Post.update({id = postId}, { $set: updateOps})); 
    })
);

router.post('/', auth, upload.single('postImage'),catchAsync(async (req, res) => {
    const coordinates = getCurrentLocation();
    await coordinatesSchema.validateAsync(coordinates[0], coordinates[1], { abortEarly: false });

        const post = new Post({
            createdById: req.body.userId,
            imageUrl: req.file.path,
            location: coordinates,
            description: req.body.description,
            isPublic: req.body.isPublic
        });
        res.status(201).json(await Post.create(post));
    
    }) 
);