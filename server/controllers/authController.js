import bcrypt from 'bcrypt';

export const register = async (req,res) => {
  try {
    const { email, full_name, password } = req.body;

    // Basic validation
    if (!email || !full_name || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, full_name, password: hashedPassword });
    await newUser.save();

    // Return success response
    res.status(201).json({ message: 'User registered successfully', user: { email, full_name } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
