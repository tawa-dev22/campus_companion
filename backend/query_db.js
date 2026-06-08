import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './src/models/User.js';
import Assignment from './src/models/Assignment.js';
import Role from './src/models/Role.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_companion');
  console.log('Connected to MongoDB');

  const users = await User.find().populate('role');
  console.log('--- USERS ---');
  users.forEach(u => {
    console.log(`Name: ${u.fullName}, Email: ${u.email}, Role: ${u.role?.name}, Program: ${u.program}, Level: ${u.level}`);
  });

  const assignments = await Assignment.find();
  console.log('--- ASSIGNMENTS ---');
  assignments.forEach(a => {
    console.log(`Title: ${a.title}, Module: ${a.module}, Program: ${a.program}, Level: ${a.level}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
