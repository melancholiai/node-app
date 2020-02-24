const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const Post = require('../../models/post');
const { CustomHttpError, Unauthorized } = require('../../errors');
const { ValidateUrl } = require('../../services/cryptography');
const { BadRequest } = require('../../errors');

const router = Router();

router.get(
    '/:postId', 
    catchAsync(async (req, res) => {
        const id = req.params.postId;
        res.status(200).json(await (await Post.findById(id)));
}));

router.put(
    '/:postId',
    catchAsync(async (req, res) => {
            const id = req.params.postId;
            res.status(200).json(await Post.update(req));
    })
);

router.post('/', catchAsync(async (req, res) => {
    const post = new Post({

    });
    res.status(201).json(await Post.create());
    }) 
);