import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CallbackError, Model } from 'mongoose';
import { PostsService } from 'src/posts/posts.service';
import { Post } from 'src/posts/schemas/post.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private postServ: PostsService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  findAll() {
    return this.userModel.find().lean({ autopopulate: true });
  }

  async addPost(post: { id: string; post: string }) {
    if (!(await this.userModel.findById(post.id)))
      throw new NotFoundException('User Not Found');

    return await this.userModel.findByIdAndUpdate(
      post.id,
      { $push: { posts: post.post } },
      { new: true },
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
