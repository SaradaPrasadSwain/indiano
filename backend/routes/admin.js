const {Router} = require('express');
const { adminModel, sellerModel, productModel } = require('../db');
const adminRouter = Router();
const bcrypt = require('bcrypt');
const jwt  = require('jsonwebtoken');
const user = require('./user');
const {adminMiddleware} = require('../middleware/admin')
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



adminRouter.get('/sellers', adminMiddleware, async(req, res) => {
    try {
        const  {status} = req.query;

    
        const  filter =  status ? {approvalStatus: status }: {};
    
        const sellers = await sellerModel.find(filter).sort({ createdAt: -1 });
    
        res.json({
            message: "Sellers fetched  successfully",
            count: sellers.length,
            sellers: sellers.map(s => ({
                id: s._id,
                name: s.name,
                email: s.email,
                businessName: s.businessName,
                phone: s.phone,
                approvalStatus: s.approvalStatus,
                isApproved: s.isApproved
            }))
        })
    } catch (error) {
        res.status(500).json({ message: "failed to fetch sellers"})
    }
})

adminRouter.get('/sellers/:sellerId',  async(req, res) => {
    const seller = await sellerModel.findById(req.params.sellerId);

    if(!seller){
        return res.status(404).json({message: "seller not found"})
    }

    const products = await productModel.find({creatorId: seller._id});
    
    res.json({
        seller: {
            id: seller._id,
            name: seller.name,
            email: seller.email,
            approvalStatus: seller.approvalStatus,
            isApproved: seller.isApproved 
        }
    })
})

adminRouter.put('/sellers/:sellerId/approve',adminMiddleware, async (req, res) => {
    const adminId = req.userId
    const sellerId = req.params.sellerId;
    
    const seller = await sellerModel.findById(sellerId);

    if(!seller) {
        return res.status(404).json({ message: "Seller not found"});
    }

    if(seller.isApproved) {
        return res.status(400).json({message: "seller already approved"});
    }

    seller.isApproved = true;
    seller.approvalStatus = 'approved';
    seller.approvedBy = adminId;
    seller.approvedAt = Date.now();
    seller.rejectionReason = undefined;

    await seller.save();

    res.json({
        message: "Seller Approved Successfully",
        seller: {
            id: seller._id,
            name: seller.name,
            email: seller.email,
            approvalStatus: seller.approvalStatus,
            approvedBy: seller.approvedBy
        }
    })
})




adminRouter.put('/sellers/:sellerId/reject',adminMiddleware, async(req, res) => {
    const adminId = req.userId
    const sellerId = req.params.sellerId;
    const { reason } = req.body;

    if(!reason) {
        return res.status(400).json({ message: "Rejection reason is required"})
    }

    const seller = await sellerModel.findById(sellerId);

    if(!seller){
        return res.status(404).json({message: "Seller not found"});
    }

    if(seller.isApproved === false){
        return res.status(400).json({message: "the seller has already rejected"})
    }
    seller.isApproved = false;
    seller.approvalStatus = 'rejected';
    seller.rejectedBy = adminId;
    seller.rejectionReason = reason;

    await seller.save();

    res.json({
        message: "Seller request rejected",
        seller: {
            id: seller._id,
            name: seller.name,
            approvalStatus: seller.approvalStatus,
            rejectionReason: seller.rejectionReason,
            rejectedBy: seller.rejectedBy
        }
    })
} )


adminRouter.get('/products', adminMiddleware, async(req, res) => {
    try {
        const {status} = req.query;
    
        const filter = status ? {approvalStatus: status} : {};
    
        const products = await productModel.find(filter).populate('creatorId', 'name email businessName').sort({createdAt: -1});
    
        res.json({
            message: "product fetched Successfully",
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({message: "failed to fetch products"})
    }

})


module.exports = {
    adminRouter: adminRouter
}

