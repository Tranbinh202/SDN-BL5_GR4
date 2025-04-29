const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    addressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    orderDate: { type: Date, default: Date.now },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "shipping",
        "shipped",
        "cancelled",
        "failed to ship",
        "rejected",
      ],
      default: "pending",
    },
    cancellationReason: { type: String },
    paymentDueDate: { type: Date },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (this.isNew && !this.paymentDueDate) {
    const PAYMENT_TIMEOUT_MINUTES = 5;
    this.paymentDueDate = new Date(
      Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000
    );
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
