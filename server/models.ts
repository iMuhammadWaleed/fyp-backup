import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { User as UserType, Category as CategoryType, MenuItem as MenuItemType, Order as OrderType, UserRole, CartItem } from './types';

// --- Override Mongoose's default ID handling to use 'id' string ---
const schemaOptions = {
    toJSON: {
        virtuals: true,
        transform: function(doc: any, ret: any) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(doc: any, ret: any) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
};

// --- MenuItem Schema (needed for CartItem) ---
const menuItemSchema = new Schema<MenuItemType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    categoryId: { type: String, required: true },
    catererId: { type: String, required: true },
}, { ...schemaOptions, timestamps: true });

export const MenuItem: mongoose.Model<MenuItemType> = models.MenuItem || model<MenuItemType>('MenuItem', menuItemSchema);

// --- CartItem Sub-schema (embedded in User and Order) ---
const cartItemSchema = new Schema<CartItem>({
    item: { type: menuItemSchema, required: true },
    quantity: { type: Number, required: true },
}, { _id: false });


// --- User Schema ---
const userSchema = new Schema<UserType>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Hide by default
    role: { type: String, enum: Object.values(UserRole), required: true },
    businessName: { type: String },
    businessDescription: { type: String },
    phone: { type: String },
    favorites: { type: [String], default: [] },
    cart: { type: [cartItemSchema], default: [] },
}, { ...schemaOptions, timestamps: true });

// Show password when explicitly requested
userSchema.pre('findOne', function() { this.select('+password'); });

export const User: mongoose.Model<UserType> = models.User || model<UserType>('User', userSchema);


// --- Category Schema ---
const categorySchema = new Schema<CategoryType>({
    name: { type: String, required: true, unique: true },
}, { ...schemaOptions, timestamps: true });

export const Category: mongoose.Model<CategoryType> = models.Category || model<CategoryType>('Category', categorySchema);


// --- Order Schema ---
const orderSchema = new Schema<OrderType>({
    userId: { type: String, required: true },
    customerName: { type: String, required: true },
    items: [cartItemSchema],
    total: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'] },
    orderDate: { type: String, required: true },
}, { ...schemaOptions, timestamps: true });

export const Order: mongoose.Model<OrderType> = models.Order || model<OrderType>('Order', orderSchema);