import Address from '../models/Address.js';

export const addAddress = async (req, res) => {
  try {
    const { addressLine1, street, landmark, city, state, pinCode } = req.body;
    const address = new Address({
      user: req.user._id,
      addressLine1,
      street,
      landmark,
      city,
      state,
      pinCode,
    });
    await address.save();
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    Object.assign(address, req.body);
    await address.save();
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 