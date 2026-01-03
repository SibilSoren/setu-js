import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Example User model - customize this for your application
 * 
 * Documentation: https://mongoosejs.com/docs/guide.html
 */

// Define the interface for User document
export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // Don't include in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Create and export the model
export const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

/**
 * Add more models below as needed:
 * 
 * export interface IPost extends Document {
 *   title: string;
 *   content?: string;
 *   author: mongoose.Types.ObjectId;
 *   createdAt: Date;
 * }
 * 
 * const PostSchema = new Schema<IPost>({
 *   title: { type: String, required: true },
 *   content: String,
 *   author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
 * }, { timestamps: true });
 * 
 * export const Post: Model<IPost> = 
 *   mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
 */
