import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Type } from 'class-transformer';
import { User } from 'src/users/schemas/user.schema';
import { softDeletePlugin } from 'src/global/soft-delete/soft-delete.plugin';

export type PostDocument = Post & Document;

@Schema({ timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' } })
export class Post {
  @Prop({ type: Types.ObjectId })
  Id: string;

  @Prop({ type: String })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'User', autopopulate: { maxDepth: 2 } })
  @Type(() => User)
  creator: User;

  @Prop({ type: Date, default: null, expires: 1, index: true })
  DeletedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 1 });

PostSchema.plugin(softDeletePlugin);

PostSchema.pre<Post>('save', function () {
  const store = this as any;

  if (store.isNew) {
    store._doc.Id = store._id;
    delete store._doc.__v;
  }
});
