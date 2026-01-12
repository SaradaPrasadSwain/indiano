const {Router} = require('express');
const { adminModel } = require('../db');
const adminRouter = Router();
const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');
const user = require('./user');
const { userSecretKey, adminSecretKey, sellerSecretKey } = require('../config');



adminRouter.post('/signup', async(req, res) => {
    try {
        const {name, email, password, secretCode} = req.body;
    
        if(secretCode !== process.env.ADMIN_SECRET_CODE){
            return res.status(403).json({message: "Invalid secret code"});
        }
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
    
        const existingAdmin = await adminModel.findOne({ email });
        
        if(existingAdmin){
            return res.status(400).json({message: "Admin already exists"})
        }
    
        // TODO: Lock admin signup & add super-admin protection before production
    
        const adminCount = await adminModel.countDocuments();
        const role = adminCount === 0 ? 'super_admin': 'admin';
    
        const permissions = role === 'super_admin' ? {
            canApproveSellers: true,
            canApproveProducts: true,
            canManageOrders: true,
            canViewAnalytics: true,
            canManageAdmins: true,
        }:{
            canApproveSellers: true,
            canApproveProducts: true,
            canManageOrders: true,
            canViewAnalytics: true,
            canManageAdmins: false
        }
    
        await adminModel.create({
            name,
            email,
            password: await bcrypt.hash(password, 5),
            role,
            permissions
        });

        res.status(201).json({ message: "Admin created successfully", role});
    } catch (error) {
        res.status(500).json({ message: "Signup failed"});
    }
})


adminRouter.post('/signin', async(req, res) => {
    try {
        const {email, password} = req.body;
    
        const admin = await adminModel.findOne({
            email: email
        })
    
        const hashedPassword = bcrypt.compare(password, admin.password);
    
        if(hashedPassword){
            const token = jwt.sign({id: admin._id}, adminSecretKey);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.json({
                token,
                message: "Login Successful",
                name: admin.name,
                role: admin.role
            });
        }
        else{
            res.status(404).json({message: "please check the username and password"})
        }
    } catch (error) {
        res.status(403).json({
            message: "please check your signin credentials"
        })
    }
})

adminRouter.get('/sellers', async(req, res) => {
    try {
        const  {status} = req.query;
    
        const  filter =  status ? {approvalStatus: status }: {};
    
        const sellers = await sellerModel.find(filter).sort({ createdAt: -1 });
    
        res.json({
            message: "Sellers fetched  successfully",
            count: sellers.length
        })
    } catch (error) {
        res.status(500).json({ message: "failed to fetch sellers"})
    }
})


module.exports = {
    adminRouter: adminRouter
}

