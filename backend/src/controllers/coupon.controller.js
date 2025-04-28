const Coupon = require("../models/Coupon");

const createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, startDate, endDate, maxUsage, productId } =
            req.body;

        const newCoupon = new Coupon({
            code,
            discountPercent,
            startDate,
            endDate,
            maxUsage,
            productId,
        });

        const savedCoupon = await newCoupon.save();

        res.status(201).json(savedCoupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().populate("productId");
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCouponBySellerID = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const coupons = await Coupon.find().populate("productId");
        const result = coupons.filter((coupon) => coupon.productId.sellerId == sellerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (!coupon) {
            return res.status(404).json({ 
                success: false, 
                message: "Mã giảm giá không tồn tại" 
            });
        }
        
        const now = new Date();
        
        if (now > new Date(coupon.endDate)) {
            return res.status(400).json({ 
                success: false, 
                message: "Mã giảm giá đã hết hạn" 
            });
        }
        
        if (now < new Date(coupon.startDate)) {
            return res.status(400).json({ 
                success: false, 
                message: "Mã giảm giá chưa có hiệu lực" 
            });
        }
        
        if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
            return res.status(400).json({ 
                success: false, 
                message: "Mã giảm giá đã hết lượt sử dụng" 
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Mã giảm giá hợp lệ",
            coupon: {
                code: coupon.code,
                discountPercent: coupon.discountPercent,
                productId: coupon.productId
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Đã xảy ra lỗi", 
            error: error.message 
        });
    }
};

const updateCoupon = async (req, res) => {
    try {
        const { code, discountPercent, startDate, endDate, maxUsage, productId } =
            req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                code,
                discountPercent,
                startDate,
                endDate,
                maxUsage,
                productId,
            },
            { new: true }
        );
        res.status(200).json(
            updatedCoupon
        )
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedCoupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCoupon,
    getCouponBySellerID,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    verifyCoupon
};