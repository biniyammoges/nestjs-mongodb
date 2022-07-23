import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { Post } from 'src/posts/schemas/post.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: Types.ObjectId })
  Id: string;

  @Prop({ type: String })
  name: string;

  @Prop()
  email: string;

  @Prop([{ type: Types.ObjectId, ref: 'Post', autopopulate: { maxDepth: 1 } }])
  @Type(() => Post)
  posts: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', function () {
  const store = this as any;

  if (store.isNew) {
    store._doc.Id = store._id;
  }
});
