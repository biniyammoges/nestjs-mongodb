import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomModel } from '../global/soft-delete/soft-delete.model';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    public postModel: CustomModel<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = new this.postModel(createPostDto);
    await post.populate('creator');
    await post.save();
    return post;
  }

  findAll(t = false) {
    return this.postModel.find();

    // const unwindFields = ['$Count', '$MonthCount', '$YearCount'];
    // return this.postModel.aggregate([
    // { $match: { CreatedAt: { $ne: null } } },
    // {
    //   $facet: {
    //     Count: [{ $count: 'Total' }],
    //     MonthCount: [
    //       {
    //         $match: {
    //           $and: [
    //             { CreatedAt: { $gt: initialDate('Month') } },
    //             { CreatedAt: { $lt: new Date(Date.now()) } },
    //           ],
    //         },
    //       },
    //       { $count: 'Total' },
    //     ],
    //     YearCount: [
    //       {
    //         $match: {
    //           $and: [
    //             { CreatedAt: { $gt: initialDate() } },
    //             { CreatedAt: { $lt: new Date(Date.now()) } },
    //           ],
    //         },
    //       },
    //       { $count: 'Total' },
    //     ],
    //   },
    // },
    // ...unwindFields.map((field) => ({ $unwind: field })),
    // unwindFields.reduce(
    //   (pipeline, field) => ({
    //     ...pipeline,
    //     $addFields: {
    //       ...pipeline.$addFields,
    //       [field.replace('$', '')]: `${field}.Total`,
    //     },
    //   }),
    //   { $addFields: {} },
    // ),
    // {
    //   $facet: {
    //     count: [
    //       { $group: { _id: '$_id', count: { $sum: 1 } } },
    //       { $project: { _id: 0 } },
    //     ],
    //     // result: [{ $skip: 0 }, { $limit: 1 }],
    //   },
    // },
    // { $unwind: '$count' },
    // { $addFields: { count: '$count.Total' } },
    // CreatedAt: true
    //   ? { $or: [null, { $month: new Date(Date.now()) }] }
    //   : { $ne: null },
    // $or: false
    //   ? [{ CreatedAt: { $ne: null } }]
    //   : [
    //       { createdAt: null },
    //       {
    //         $expr: {
    //           $eq: [
    //             { $month: '$CreatedAt' },
    //             { $month: new Date(Date.now()) },
    //           ],
    //         },
    //       },
    //     ],
    // $addFields: {
    //   month: { $month: '$CreatedAt' },
    //   mongth: { $month: new Date(Date.now()) },
    //   year: { $year: new Date(Date.now()) },
    // },
    // ]);
  }

  findOne(id: string) {
    return this.postModel.aggregate([
      {
        $match: {
          $expr: { $eq: ['$Id', { $toObjectId: id }] },
          DeletedAt: null,
        },
      },
    ]);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return await this.postModel.findByIdAndUpdate(id, updatePostDto, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.postModel.findByIdAndUpdate(
      id,
      {
        $set: { DeletedAt: new Date(), $isDeleted: true },
      },
      { new: true },
    );
    // return this.postModel.softDelete({ _id: id });
  }
}
