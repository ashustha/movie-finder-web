import express from 'express';
import env from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import multer from 'multer';
import { connection } from './db.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

env.config({ path: './.env' });

const app = express();
app.use(cookieParser());

app.use(cors());
app.use(express.json());
const port = 3000;

app.use(bodyParser.json());

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'], // Allow both origins
    credentials: true,
  })
);
app.use(cookieParser());

// To handle __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
// Serve the uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/register', async (req, res) => {
  const { email, full_name, password } = req.body;

  // Basic validation
  if (!email || !full_name || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if email already exists in the database
    const [existingUser] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const [result] = await connection.query(
      'INSERT INTO users (email, full_name, password) VALUES (?, ?, ?)',
      [email, full_name, hashedPassword]
    );

    // Extract the newly created user_id
    const newUserId = result.insertId;

    // Insert default wishlist_statuses for the new user
    await connection.query(
      'INSERT INTO wishlist_statuses (user_id, is_public) VALUES (?, ?)',
      [newUserId, 0]
    );

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      user: { email, full_name },
    });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if user with the provided email exists in the database
    const [results] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const existingUser = results[0];

    // If user doesn't exist, return error
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare hashed password with the provided password
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    // If passwords don't match, return error
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: existingUser.user_id }, // Ensure correct field for user ID
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set JWT token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    // Fetch wishlist movie IDs and the public status for the user
    const [wishlistResults] = await connection.query(
      `
      SELECT ws.is_public, w.movie_id
      FROM wishlist_statuses AS ws
      LEFT JOIN wishlists AS w ON ws.user_id = w.user_id
      WHERE ws.user_id = ?
      `,
      [existingUser.user_id]
    );

    console.log(wishlistResults);

    // Extract wishlist items and the public status
    const isPublic =
      wishlistResults.length > 0 ? wishlistResults[0].is_public : null;
    const wishlist = wishlistResults
      .filter((row) => row.movie_id !== null)
      .map((row) => ({
        movie_id: row.movie_id,
      }));

    console.log('isPublic:', isPublic);
    console.log('wishlist:', wishlist);

    // Passwords match, login successful
    res.status(200).json({
      token,
      message: 'Login successful',
      user: {
        id: existingUser.user_id, // Ensure correct field for user ID
        email: existingUser.email,
        full_name: existingUser.full_name,
        wishlist_movies: wishlist,
        is_public: isPublic,
      },
    });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

app.get('/api/check-authentication', (req, res) => {
  try {
    // Check if the HTTP-only cookie named 'token' exists in the request
    const token = req.cookies.token;

    console.log('Token:', token); // Log the token

    // If the token exists, the user is authenticated
    const isLoggedIn = !!token;

    console.log('IsLoggedIn:', isLoggedIn); // Log the authentication status

    // Respond with the authentication status
    res.status(200).json({ isLoggedIn });
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  // Clear the HTTP-only cookie containing the JWT token
  res.clearCookie('token', { path: '/' });
  res.status(200).json({ message: 'Logout successful' });
});

//---Changing Password
app.put('/api/change-password/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { oldPassword, newPassword } = req.body;

  // Validate request body
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Old password and new password are required.' });
  }

  try {
    // Check if the old password matches the current password in the database
    const [results] = await connection.query(
      'SELECT password FROM users WHERE user_id = ?',
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentHashedPassword = results[0].password;

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the hashed password in the database
    await connection.query('UPDATE users SET password = ? WHERE user_id = ?', [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

//Get a movie by ID
app.get('/api/movies/:movie_id', async (req, res) => {
  const { movie_id } = req.params;
  const { userId } = req.query; // Optional, only for signed-in users

  try {
    const movieQuery = `SELECT * FROM movies WHERE movie_id = ?`;
    const [movieResult] = await connection.query(movieQuery, [movie_id]);

    if (!movieResult.length) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    let averageRating = movieResult[0].average_rating;

    // If the user is signed in, check for recalculated ratings or calculate them
    if (userId) {
      const recalculatedRatingQuery = `
        SELECT recalculated_rating FROM user_movie_ratings
        WHERE user_id = ? AND movie_id = ?
      `;
      const [recalculatedRatingResult] = await connection.query(
        recalculatedRatingQuery,
        [userId, movie_id]
      );

      if (recalculatedRatingResult.length > 0) {
        // Use the stored recalculated rating
        averageRating = recalculatedRatingResult[0].recalculated_rating;
      } else {
        // No recalculated rating, so recalculate now
        const bannedUsersQuery = `
          SELECT banned_user_id FROM banned_users WHERE user_id = ?
        `;
        const [bannedUsers] = await connection.query(bannedUsersQuery, [
          userId,
        ]);
        const bannedUserIds = bannedUsers.map((bu) => bu.banned_user_id);

        // Recalculate the average rating excluding the banned users
        const newAvgRatingQuery = `
          SELECT AVG(rating) AS avg_rating
          FROM movie_reviews
          WHERE movie_id = ? AND user_id NOT IN (?)
        `;
        const [newAvgRatingResult] = await connection.query(newAvgRatingQuery, [
          movie_id,
          bannedUserIds,
        ]);

        averageRating = newAvgRatingResult[0].avg_rating || 0;

        // **Log Values for Debugging**
        console.log('Recalculated Rating: ', averageRating);
        console.log('User ID: ', userId);
        console.log('Movie ID: ', movie_id);

        // **Insert the recalculated rating into user_movie_ratings**
        const insertRecalculatedRatingQuery = `
          INSERT INTO user_movie_ratings (user_id, movie_id, recalculated_rating)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE recalculated_rating = VALUES(recalculated_rating)
        `;

        try {
          // Execute the query and check if it's successful
          const result = await connection.query(insertRecalculatedRatingQuery, [
            userId,
            movie_id,
            averageRating,
          ]);
          console.log('Insert result: ', result); // Log the result of the insert query
        } catch (error) {
          console.error('Error inserting recalculated rating: ', error);
        }
      }
    }

    res.status(200).json({
      movie: movieResult[0],
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/movies/:id/details', async (req, res) => {
  const movieId = req.params.id;
  const userId = req.query.userId;

  console.log('movieId:', movieId, 'userId:', userId); // Log for debugging

  const query = `
    SELECT 
      m.title AS movie_title, 
      d.director_name, 
      CONCAT('[', GROUP_CONCAT(DISTINCT '{"name": "', w.writer_name, '", "id": ', w.writer_id, '}' ORDER BY w.writer_name), ']') AS writers, 
      CONCAT('[', GROUP_CONCAT(DISTINCT '{"id": ', s.star_id, ', "name": "', s.star_name, '"}' ORDER BY s.star_name), ']') AS stars,
      CONCAT('[', GROUP_CONCAT(DISTINCT '{"id": ', g.genre_id, ', "name": "', g.genre_name, '"}' ORDER BY g.genre_name), ']') AS genres,
      m.year, 
      m.duration, 
      m.budget, 
      m.release_date, 
      m.country_of_origin, 
      m.opening_week, 
      m.box_office_collection, 
      m.description, 
      m.poster, 
      m.banner, 
      m.average_rating,
      m.trailer,
      m.marked_for_deletion
    FROM 
      movies m
    INNER JOIN 
      directors d ON m.director_id = d.director_id
    LEFT JOIN 
      movie_writers mw ON m.movie_id = mw.movie_id
    LEFT JOIN 
      writers w ON mw.writer_id = w.writer_id
    LEFT JOIN 
      movie_stars ms ON m.movie_id = ms.movie_id 
    LEFT JOIN 
      stars s ON ms.star_id = s.star_id
    LEFT JOIN 
      movie_genres mg ON m.movie_id = mg.movie_id
    LEFT JOIN 
      genres g ON mg.genre_id = g.genre_id
    WHERE 
      m.movie_id = ?
    GROUP BY 
      m.movie_id
  `;

  try {
    const [movieDetailsResults] = await connection.query(query, [movieId]);

    if (movieDetailsResults.length === 0) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    let movieDetails = movieDetailsResults[0];

    // Fetch all ratings for the movie
    const ratingsQuery = `
      SELECT r.rating, r.user_id
      FROM movie_reviews r
      WHERE r.movie_id = ?
    `;
    const [ratingsResults] = await connection.query(ratingsQuery, [movieId]);

    if (userId) {
      // Fetch banned writers for the user
      const bannedWritersQuery = `SELECT banned_user_id FROM banned_users WHERE user_id = ?`;
      const [bannedWritersResults] = await connection.query(
        bannedWritersQuery,
        [userId]
      );

      const bannedWriterIds = bannedWritersResults.map(
        (row) => row.banned_user_id
      );

      // Filter out reviews from banned writers
      const filteredRatings = ratingsResults.filter(
        (rating) => !bannedWriterIds.includes(rating.user_id)
      );

      if (filteredRatings.length > 0) {
        // Recalculate average rating excluding banned writers' reviews
        const recalculatedAverageRating =
          filteredRatings.reduce((sum, review) => sum + review.rating, 0) /
          filteredRatings.length;
        movieDetails.recalculated_average_rating = recalculatedAverageRating;
      } else {
        // If no valid ratings are left, set recalculated rating to null or 0
        movieDetails.recalculated_average_rating = null;
      }

      // Filter writers if the user has banned them
      const writersArray = JSON.parse(movieDetails.writers).filter(
        (writer) => !bannedWriterIds.includes(writer.id)
      );

      movieDetails.writers = JSON.stringify(writersArray);

      // Fetch custom rating for the user if it exists
      const customRatingQuery = `
        SELECT custom_rating
        FROM custom_user_movie_ratings
        WHERE user_id = ? AND movie_id = ?
      `;

      console.log(
        'Fetching custom rating for userId:',
        userId,
        'movieId:',
        movieId
      ); // Debugging log

      const [ratingResults] = await connection.query(customRatingQuery, [
        userId,
        movieId,
      ]);

      console.log('Custom rating results:', ratingResults); // Debugging log

      if (ratingResults.length > 0) {
        movieDetails.custom_rating = ratingResults[0].custom_rating; // Separate from average rating
      } else {
        movieDetails.custom_rating = null; // Handle case where there's no custom rating
      }
    }

    res.json(movieDetails);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

//API endpoint to get similar movies
app.get('/api/movies/:id/similar', async (req, res) => {
  const movieId = req.params.id;

  const query = `
    SELECT 
      m.movie_id,
      m.title,
      m.poster,
      m.average_rating,
      m.year,
      m.duration
    FROM 
      movies m
    INNER JOIN 
      movie_genres mg ON m.movie_id = mg.movie_id
    WHERE 
      mg.genre_id IN (
        SELECT 
          genre_id
        FROM 
          movie_genres
        WHERE 
          movie_id = ?
      )
    AND 
      m.movie_id != ?
    GROUP BY 
      m.movie_id
    ORDER BY 
      RAND()
    LIMIT 
      4
  `;

  try {
    const [results] = await connection.query(query, [movieId, movieId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'No similar movies found' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to get a list of movie cards
app.get('/api/movie', async (req, res) => {
  const userId = req.query.userId; // Get the userId from the query parameters

  try {
    // Base query to get the list of movies
    let query = `
      SELECT 
        m.movie_id,
        m.title,
        m.poster,
        m.year,
        m.duration,
        m.average_rating -- This is the true average rating (including all users)
      FROM 
        movies m
    `;

    const [movies] = await connection.query(query);

    if (movies.length === 0) {
      return res.status(404).json({ error: 'No movies found' });
    }

    // If a userId is provided, we need to handle personalized ratings
    if (userId) {
      for (let movie of movies) {
        // 1. Check if there is a custom recalculated rating for this user and movie
        const customRatingQuery = `
          SELECT custom_rating
          FROM custom_user_movie_ratings
          WHERE user_id = ? AND movie_id = ?
        `;
        const [ratingResults] = await connection.query(customRatingQuery, [
          userId,
          movie.movie_id,
        ]);

        // If there is a custom rating, override the average rating for this user
        if (ratingResults.length > 0) {
          movie.custom_average_rating = ratingResults[0].custom_rating; // Store the custom rating
        } else {
          // 2. If no custom rating exists, calculate the average rating excluding banned users
          const avgRatingQuery = `
            SELECT AVG(r.rating) AS avg_rating
            FROM movie_reviews r
            WHERE r.movie_id = ? 
            AND r.user_id NOT IN (
              SELECT banned_user_id 
              FROM banned_users 
              WHERE user_id = ?
            )
          `;

          const [avgRatingResult] = await connection.query(avgRatingQuery, [
            movie.movie_id,
            userId,
          ]);

          // Store the recalculated average rating, or 0 if there are no ratings
          movie.custom_average_rating = avgRatingResult[0].avg_rating || 0;
        }
      }
    }

    // Return the list of movies with both the true average rating and the user's custom average rating
    const result = movies.map((movie) => ({
      ...movie,
      average_rating: movie.average_rating, // True average rating
      custom_average_rating:
        movie.custom_average_rating || movie.average_rating, // Use custom if available, otherwise fallback to true average
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in API request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a movie
app.delete('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;

  const checkQuery = 'SELECT * FROM movies WHERE movie_id = ?';

  try {
    const [results] = await connection.query(checkQuery, [movieId]);

    if (results.length === 0) {
      return res.status(404).send('Movie not found');
    }

    const deleteQuery = 'DELETE FROM movies WHERE movie_id = ?';
    console.log(`Executing query: ${deleteQuery} with movieId: ${movieId}`);

    await connection.query(deleteQuery, [movieId]);

    res.sendStatus(204); // No Content
  } catch (error) {
    console.error('Failed to delete movie:', error);
    res.status(500).send('Failed to delete movie');
  }
});

// Endpoint to add a movie to the wishlist
app.post('/api/addToWishlist', async (req, res) => {
  const { user_id, movie_id } = req.body;

  console.log('ids', user_id, movie_id);

  try {
    // Check if the combination already exists in the wishlist table
    const [existingWishlistItem] = await connection.query(
      'SELECT * FROM wishlists WHERE user_id = ? AND movie_id = ?',
      [user_id, movie_id]
    );

    if (existingWishlistItem.length > 0) {
      await connection.query(
        'DELETE FROM wishlists WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id]
      );

      res
        .status(200)
        .json({ message: 'Movie removed from wishlist successfully.' });
    } else {
      // If the combination doesn't exist, add it to the wishlist table
      await connection.query(
        'INSERT INTO wishlists (user_id, movie_id) VALUES (?, ?)',
        [user_id, movie_id]
      );

      res
        .status(200)
        .json({ message: 'Movie added to wishlist successfully.' });
    }
  } catch (error) {
    console.error('Error adding movie to wishlist:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

//Endpoint to fetch wishlist for the specific user
app.get('/api/wishlist/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  // Query to get the wishlist items and the public status
  const query = `
    SELECT ws.is_public, m.*
    FROM wishlists AS w
    INNER JOIN movies AS m ON w.movie_id = m.movie_id
    INNER JOIN wishlist_statuses AS ws ON w.user_id = ws.user_id
    WHERE w.user_id = ?
  `;

  try {
    const [results] = await connection.query(query, [userId]);

    if (results.length === 0) {
      return res.json({ is_public: false, wishlist: [] });
    }

    // Extract the is_public status and wishlist items
    const isPublic = results[0].is_public;
    const wishlist = results.map((row) => {
      const { is_public, ...movie } = row; // Exclude is_public from the movie object
      return movie;
    });

    res.json({ is_public: isPublic, wishlist });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Get all movies from the database
app.get('/api/movies', async (req, res) => {
  const { movie, director, genre } = req.query;
  let baseQuery = `
    SELECT DISTINCT m.*
    FROM movies m
    LEFT JOIN directors d ON m.director_id = d.director_id
    LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
    LEFT JOIN genres g ON mg.genre_id = g.genre_id
    WHERE 1=1
  `;

  const queryParams = [];

  if (movie) {
    queryParams.push(`%${movie}%`);
    baseQuery += ` AND LOWER(m.title) LIKE LOWER(?)`;
  }

  if (director) {
    queryParams.push(`%${director}%`);
    baseQuery += ` AND LOWER(d.director_name) LIKE LOWER(?)`;
  }

  if (genre) {
    queryParams.push(`%${genre}%`);
    baseQuery += ` AND LOWER(g.genre_name) LIKE LOWER(?)`;
  }

  baseQuery += ` ORDER BY m.average_rating DESC, m.title ASC`;

  try {
    const [rows] = await connection.query(baseQuery, queryParams);
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Add a new movie
app.post('/api/movies', async (req, res) => {
  const {
    title,
    director_id,
    year,
    duration,
    budget,
    release_date,
    country_of_origin,
    opening_week,
    box_office_collection,
    description,
    poster,
    banner,
    trailer,
    writer_ids,
    star_ids,
    genre_ids,
  } = req.body;

  const movie = {
    title,
    director_id,
    year,
    duration,
    budget,
    release_date,
    country_of_origin,
    opening_week,
    box_office_collection,
    description,
    poster,
    banner,
    trailer,
  };

  try {
    const [result] = await connection.query('INSERT INTO movies SET ?', movie);
    const movie_id = result.insertId;

    // Insert writers
    if (writer_ids && writer_ids.length > 0) {
      const writerValues = writer_ids.map((writer_id) => [movie_id, writer_id]);
      await connection.query(
        'INSERT INTO movie_writers (movie_id, writer_id) VALUES ?',
        [writerValues]
      );
    }

    // Insert stars
    if (star_ids && star_ids.length > 0) {
      const starValues = star_ids.map((star_id) => [movie_id, star_id]);
      await connection.query(
        'INSERT INTO movie_stars (movie_id, star_id) VALUES ?',
        [starValues]
      );
    }

    // Insert genres
    if (genre_ids && genre_ids.length > 0) {
      const genreValues = genre_ids.map((genre_id) => [movie_id, genre_id]);
      await connection.query(
        'INSERT INTO movie_genres (movie_id, genre_id) VALUES ?',
        [genreValues]
      );
    }

    res.status(201).json({ message: 'Movie added successfully', movie_id });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Watchlist status update
app.put('/api/wishlist/:userId/status', async (req, res) => {
  const { userId } = req.params;
  const { is_public } = req.body;

  if (typeof is_public !== 'boolean') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const query = `
    INSERT INTO wishlist_statuses (user_id, is_public)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE is_public = VALUES(is_public)
  `;

  try {
    await connection.query(query, [userId, is_public]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating wishlist status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a movie by ID
app.put('/api/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  const {
    title,
    director_id,
    year,
    duration,
    budget,
    release_date,
    country_of_origin,
    opening_week,
    box_office_collection,
    description,
    poster,
    banner,
    trailer,
    writer_ids = [],
    star_ids = [],
    genre_ids = [],
    marked_for_deletion,
    deletion_date,
  } = req.body;

  console.log('Received data:', {
    title,
    director_id,
    year,
    duration,
    budget,
    release_date,
    country_of_origin,
    opening_week,
    box_office_collection,
    description,
    poster,
    banner,
    trailer,
    writer_ids,
    star_ids,
    genre_ids,
    marked_for_deletion,
    deletion_date,
  });

  try {
    await connection.beginTransaction();

    // Update movie details
    const updateMovieQuery = `
      UPDATE movies
      SET title = ?, director_id = ?, year = ?, duration = ?,
          budget = ?, release_date = ?, country_of_origin = ?,
          opening_week = ?, box_office_collection = ?, description = ?,
          poster = ?, banner = ?, trailer = ?,marked_for_deletion= ?, deletion_date = ?
      WHERE movie_id = ?
    `;
    const [updateResult] = await connection.query(updateMovieQuery, [
      title,
      director_id,
      year,
      duration,
      budget,
      release_date,
      country_of_origin,
      opening_week,
      box_office_collection,
      description,
      poster,
      banner,
      trailer,
      marked_for_deletion,
      deletion_date,
      movieId,
    ]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Movie not found');
    }

    // Update writers
    if (writer_ids.length > 0) {
      await connection.query('DELETE FROM movie_writers WHERE movie_id = ?', [
        movieId,
      ]);
      const writerInsertPromises = writer_ids.map((writer_id) =>
        connection.query(
          'INSERT INTO movie_writers (movie_id, writer_id) VALUES (?, ?)',
          [movieId, writer_id]
        )
      );
      await Promise.all(writerInsertPromises);
    }

    // Update stars
    if (star_ids.length > 0) {
      await connection.query('DELETE FROM movie_stars WHERE movie_id = ?', [
        movieId,
      ]);
      const starInsertPromises = star_ids.map((star_id) =>
        connection.query(
          'INSERT INTO movie_stars (movie_id, star_id) VALUES (?, ?)',
          [movieId, star_id]
        )
      );
      await Promise.all(starInsertPromises);
    }

    // Update genres
    if (genre_ids.length > 0) {
      await connection.query('DELETE FROM movie_genres WHERE movie_id = ?', [
        movieId,
      ]);
      const genreInsertPromises = genre_ids.map((genre_id) =>
        connection.query(
          'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
          [movieId, genre_id]
        )
      );
      await Promise.all(genreInsertPromises);
    }

    await connection.commit();
    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating movie:', error);
    res
      .status(500)
      .json({ error: 'Failed to update movie', details: error.message });
  }
});

//Watchlist get Status
app.get('/api/wishlist/:userId/status', async (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT is_public
    FROM wishlist_statuses
    WHERE user_id = ?
  `;

  try {
    const [rows] = await connection.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist status not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching wishlist status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to fetch all genres
app.get('/api/genres', async (req, res) => {
  const query = 'SELECT * FROM genres';

  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all directors
app.get('/api/directors', async (req, res) => {
  const query = 'SELECT * FROM directors';

  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch writers
app.get('/api/writers', async (req, res) => {
  const query = 'SELECT * FROM writers'; // Adjust table name and fields

  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Failed to fetch writers:', err);
    res.status(500).send('Failed to fetch writers');
  }
});

// Fetch stars
app.get('/api/stars', async (req, res) => {
  const query = 'SELECT * FROM stars'; // Adjust table name and fields

  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Failed to fetch stars:', err);
    res.status(500).send('Failed to fetch stars');
  }
});

// Admin login
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  try {
    const [results] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, isAdmin: user.is_admin });
  } catch (err) {
    console.error('Database query failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to get users
app.get('/api/users', async (req, res) => {
  const query =
    'SELECT user_id, email, full_name, joined_date FROM users WHERE is_admin = 0';

  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Failed to fetch users');
  }
});

// Add a new director
app.post('/api/directors', async (req, res) => {
  const { name } = req.body;
  const query = 'INSERT INTO directors (director_name) VALUES (?)';

  try {
    const [results] = await connection.query(query, [name]);
    res.json({ director_id: results.insertId, director_name: name });
  } catch (err) {
    console.error('Error adding director:', err);
    res.status(500).send('Failed to add director');
  }
});

// Fetch user detail by ID
app.get('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).send('Invalid user ID');
  }

  const userQuery = `
    SELECT user_id, full_name, email, joined_date
    FROM users
    WHERE user_id = ?
  `;

  try {
    // Fetch user details
    const [userResults] = await connection.query(userQuery, [userId]);
    const user = userResults[0];

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).send('Failed to fetch user details');
  }
});

// Add a new writer
app.post('/api/writers', async (req, res) => {
  const { name } = req.body;
  const query = 'INSERT INTO writers (writer_name) VALUES (?)';

  try {
    const [results] = await connection.query(query, [name]);
    res.json({ writer_id: results.insertId, writer_name: name });
  } catch (err) {
    console.error('Error adding writer:', err);
    res.status(500).send('Failed to add writer');
  }
});

// Add a new star
app.post('/api/stars', async (req, res) => {
  const { name } = req.body;
  const query = 'INSERT INTO stars (star_name) VALUES (?)';

  try {
    const [results] = await connection.query(query, [name]);
    res.json({ star_id: results.insertId, star_name: name });
  } catch (err) {
    console.error('Error adding star:', err);
    res.status(500).send('Failed to add star');
  }
});

// Delete a director
app.delete('/api/directors/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM directors WHERE director_id = ?';

  try {
    await connection.query(query, [id]);
    res.sendStatus(204); // No Content
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete director as they are included in a movie',
      });
    }
    console.error('Error deleting director:', err);
    return res.status(500).send('Failed to delete director');
  }
});

// Delete a writer
app.delete('/api/writers/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM writers WHERE writer_id = ?';

  try {
    await connection.query(query, [id]);
    res.sendStatus(204); // No Content
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete writer as they are included in a movie',
      });
    }
    console.error('Error deleting writer:', err);
    return res.status(500).send('Failed to delete writer');
  }
});

// Delete a star
app.delete('/api/stars/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM stars WHERE star_id = ?';

  try {
    await connection.query(query, [id]);
    res.sendStatus(204); // No Content
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete star as they are included in a movie',
      });
    }
    console.error('Error deleting star:', err);
    return res.status(500).send('Failed to delete star');
  }
});

app.get('/api/user-joins', async (req, res) => {
  const { period } = req.query; // period could be 'day', 'week', or 'month'
  let query = '';

  switch (period) {
    case 'week':
      query = `
        SELECT DATE_FORMAT(DATE_SUB(joined_date, INTERVAL (WEEKDAY(joined_date)) DAY), '%Y-%m-%d') AS period, COUNT(*) AS count
        FROM users
        GROUP BY DATE_FORMAT(DATE_SUB(joined_date, INTERVAL (WEEKDAY(joined_date)) DAY), '%Y-%m-%d')
        ORDER BY period;
      `;
      break;
    case 'month':
      query = `
        SELECT DATE_FORMAT(joined_date, '%Y-%m-01') AS period, COUNT(*) AS count
        FROM users
        GROUP BY DATE_FORMAT(joined_date, '%Y-%m-01')
        ORDER BY period;
      `;
      break;
    case 'day':
    default:
      query = `
        SELECT DATE_FORMAT(joined_date, '%Y-%m-%d') AS period, COUNT(*) AS count
        FROM users
        GROUP BY DATE_FORMAT(joined_date, '%Y-%m-%d')
        ORDER BY period;
      `;
      break;
  }

  try {
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching user joins:', err);
    res.status(500).send('Failed to fetch user joins');
  }
});

// Fetch top 3 movies in the box office
app.get('/api/top-box-office-movies', async (req, res) => {
  try {
    const query = `
      SELECT 
        movie_id,
        title, 
        box_office_collection, 
        budget, 
        opening_week, 
        poster
      FROM movies
      ORDER BY box_office_collection DESC
      LIMIT 3
    `;

    const [rows] = await connection.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching top box office movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to rate a movie and add a comment
app.post('/api/movies/:movie_id/rate', async (req, res) => {
  const { movie_id } = req.params;
  const { user_id, rating, comment } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ error: 'You need to signin before leaving a review.' });
  }
  if (rating === undefined || !comment) {
    return res
      .status(400)
      .json({ error: 'You need to provide all required fields.' });
  }

  try {
    const checkQuery = `SELECT review_id FROM movie_reviews WHERE movie_id = ? AND user_id = ?`;
    const [existingReview] = await connection.query(checkQuery, [
      movie_id,
      user_id,
    ]);

    if (existingReview.length > 0) {
      return res
        .status(400)
        .json({ error: 'You have already rated this movie.' });
    }

    const insertQuery = `INSERT INTO movie_reviews (movie_id, user_id, rating, written_review) VALUES (?, ?, ?, ?)`;
    await connection.query(insertQuery, [movie_id, user_id, rating, comment]);

    const updateOverallRatingQuery = `
      UPDATE movies
      SET average_rating = (
        SELECT AVG(r.rating)
        FROM movie_reviews r
        WHERE r.movie_id = ?
      )
      WHERE movie_id = ?
    `;
    await connection.query(updateOverallRatingQuery, [movie_id, movie_id]);

    const userSpecificAvgQuery = `
      SELECT AVG(r.rating) AS avg_rating
      FROM movie_reviews r
      LEFT JOIN banned_users b ON r.user_id = b.banned_user_id AND b.user_id = ?
      WHERE r.movie_id = ? AND b.banned_user_id IS NULL
    `;
    const [userSpecificAvgResult] = await connection.query(
      userSpecificAvgQuery,
      [user_id, movie_id]
    );

    const userSpecificAvgRating = userSpecificAvgResult[0].avg_rating || 0;

    const upsertUserMovieRatingQuery = `
      INSERT INTO custom_user_movie_ratings (user_id, movie_id, custom_rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE custom_rating = VALUES(custom_rating)
    `;
    await connection.query(upsertUserMovieRatingQuery, [
      user_id,
      movie_id,
      userSpecificAvgRating,
    ]);

    res.status(201).json({
      message: 'Rating and review submitted successfully.',
      user_specific_rating: userSpecificAvgRating,
    });
  } catch (error) {
    console.error('Error processing review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to rate a movie and add a comment
app.post('/api/movies/:movie_id/rate', async (req, res) => {
  const { movie_id } = req.params;
  const { user_id, rating, comment } = req.body;

  if (!user_id || rating === undefined || !comment) {
    return res
      .status(400)
      .json({ error: 'You need to provide all required fields.' });
  }

  try {
    const checkQuery = `SELECT review_id FROM movie_reviews WHERE movie_id = ? AND user_id = ?`;
    const [existingReview] = await connection.query(checkQuery, [
      movie_id,
      user_id,
    ]);

    if (existingReview.length > 0) {
      return res
        .status(400)
        .json({ error: 'You have already rated this movie.' });
    }

    const insertQuery = `INSERT INTO movie_reviews (movie_id, user_id, rating, written_review) VALUES (?, ?, ?, ?)`;
    await connection.query(insertQuery, [movie_id, user_id, rating, comment]);

    const updateOverallRatingQuery = `
      UPDATE movies
      SET average_rating = (
        SELECT AVG(r.rating)
        FROM movie_reviews r
        WHERE r.movie_id = ?
      )
      WHERE movie_id = ?
    `;
    await connection.query(updateOverallRatingQuery, [movie_id, movie_id]);

    const userSpecificAvgQuery = `
      SELECT AVG(r.rating) AS avg_rating
      FROM movie_reviews r
      LEFT JOIN banned_users b ON r.user_id = b.banned_user_id AND b.user_id = ?
      WHERE r.movie_id = ? AND b.banned_user_id IS NULL
    `;
    const [userSpecificAvgResult] = await connection.query(
      userSpecificAvgQuery,
      [user_id, movie_id]
    );

    const userSpecificAvgRating = userSpecificAvgResult[0].avg_rating || 0;

    const upsertUserMovieRatingQuery = `
      INSERT INTO custom_user_movie_ratings (user_id, movie_id, custom_rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE custom_rating = VALUES(custom_rating)
    `;
    await connection.query(upsertUserMovieRatingQuery, [
      user_id,
      movie_id,
      userSpecificAvgRating,
    ]);

    res.status(201).json({
      message: 'Rating and review submitted successfully.',
      user_specific_rating: userSpecificAvgRating,
    });
  } catch (error) {
    console.error('Error processing review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to get all reviews for a movie (no filtering by user)
app.get('/api/movies/:movie_id/reviews', async (req, res) => {
  const { movie_id } = req.params;

  try {
    const query = `
      SELECT mr.review_id, mr.rating, mr.written_review, mr.user_id, u.full_name
      FROM movie_reviews mr
      JOIN users u ON mr.user_id = u.user_id
      WHERE mr.movie_id = ?
    `;
    const [reviews] = await connection.query(query, [movie_id]);

    res.json(reviews); // Return all reviews for the movie, including user_id
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ban a writer and recalculate average ratings
app.post('/api/ban-writer', async (req, res) => {
  const { userId, bannedUserId } = req.body;

  console.log(userId, bannedUserId);

  // Check if bannedUserId is provided and not null
  if (!bannedUserId) {
    return res.status(400).json({ message: 'Banned user ID cannot be null.' });
  }

  if (userId === bannedUserId) {
    return res.status(400).json({ message: 'You cannot ban yourself.' });
  }

  const banWriterQuery = `
    INSERT INTO banned_users (user_id, banned_user_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE banned_user_id = VALUES(banned_user_id)
  `;

  try {
    await connection.query(banWriterQuery, [userId, bannedUserId]);

    const moviesQuery = `
      SELECT DISTINCT r.movie_id
      FROM movie_reviews r
      WHERE r.user_id = ?
    `;
    const [moviesResults] = await connection.query(moviesQuery, [bannedUserId]);

    const recalculatedRatings = [];

    for (const row of moviesResults) {
      const movieId = row.movie_id;

      const avgRatingQuery = `
        SELECT AVG(r.rating) AS recalculated_rating
        FROM movie_reviews r
        LEFT JOIN banned_users b ON r.user_id = b.banned_user_id AND b.user_id = ?
        WHERE r.movie_id = ? AND b.banned_user_id IS NULL
      `;
      const [avgRatingResults] = await connection.query(avgRatingQuery, [
        userId,
        movieId,
      ]);

      const recalculatedRating = avgRatingResults[0].recalculated_rating || 0;

      const upsertRatingQuery = `
        INSERT INTO custom_user_movie_ratings (user_id, movie_id, custom_rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE custom_rating = VALUES(custom_rating)
      `;
      await connection.query(upsertRatingQuery, [
        userId,
        movieId,
        recalculatedRating,
      ]);

      recalculatedRatings.push({ movieId, recalculatedRating });
    }

    res.status(200).json({
      message: 'User banned successfully',
      recalculatedRatings,
    });
  } catch (err) {
    console.error('Error banning user:', err);
    res.status(500).json({ message: 'Error banning user' });
  }
});

// API to unban a writer and recalculate average ratings
app.post('/api/unban-writer', async (req, res) => {
  const { userId, bannedUserId } = req.body;

  if (userId === bannedUserId) {
    return res.status(400).json({ message: 'You cannot unban yourself.' });
  }

  const deleteQuery = `
    DELETE FROM banned_users 
    WHERE user_id = ? AND banned_user_id = ?
  `;

  try {
    await connection.query(deleteQuery, [userId, bannedUserId]);

    const moviesQuery = `
      SELECT DISTINCT r.movie_id
      FROM movie_reviews r
      WHERE r.user_id = ?
    `;
    const [moviesResults] = await connection.query(moviesQuery, [bannedUserId]);

    const recalculatedRatings = [];

    for (const row of moviesResults) {
      const movieId = row.movie_id;

      const avgRatingQuery = `
        SELECT AVG(r.rating) AS recalculated_rating
        FROM movie_reviews r
        LEFT JOIN banned_users b ON r.user_id = b.banned_user_id AND b.user_id = ?
        WHERE r.movie_id = ? AND b.banned_user_id IS NULL
      `;
      const [avgRatingResults] = await connection.query(avgRatingQuery, [
        userId,
        movieId,
      ]);

      const recalculatedRating = avgRatingResults[0].recalculated_rating || 0;

      const upsertRatingQuery = `
        INSERT INTO custom_user_movie_ratings (user_id, movie_id, custom_rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE custom_rating = VALUES(custom_rating)
      `;
      await connection.query(upsertRatingQuery, [
        userId,
        movieId,
        recalculatedRating,
      ]);

      recalculatedRatings.push({ movieId, recalculatedRating });
    }

    res.status(200).json({
      message: 'Writer unbanned and ratings updated successfully',
      recalculatedRatings,
    });
  } catch (err) {
    console.error('Error unbanning user:', err);
    res.status(500).json({ message: 'Error unbanning user' });
  }
});

// API route to get all the users in a user's ban list
app.get('/api/users/:user_id/banlist', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Query to get all banned users for the given user_id
    const query = `
      SELECT u.user_id, u.full_name, u.email 
      FROM banned_users bu
      JOIN users u ON bu.banned_user_id = u.user_id
      WHERE bu.user_id = ?
    `;

    const [bannedUsers] = await connection.query(query, [user_id]);

    // If no users are found in the ban list, return an empty array
    if (bannedUsers.length === 0) {
      return res.json({ message: 'No banned users found', bannedUsers: [] });
    }

    // Respond with the list of banned users
    res.json(bannedUsers);
  } catch (error) {
    console.error('Error fetching ban list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//News

//Get all news
app.get('/api/news', async (req, res) => {
  try {
    const query = 'SELECT * FROM news';
    const [newsItems] = await connection.query(query);

    res.json(newsItems);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Get Single News by ID
app.get('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  // Ensure the id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID, must be a number' });
  }

  try {
    const query = 'SELECT * FROM news WHERE id = ?';
    const [newsItem] = await connection.query(query, [id]);

    if (newsItem.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(newsItem[0]);
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/news', upload.single('image'), async (req, res) => {
  const { title, paragraph } = req.body;

  // Get the relative path to store in the database
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!imagePath) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const query = 'INSERT INTO news (image, title, paragraph) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [
      imagePath,
      title,
      paragraph,
    ]);

    res.status(201).json({ message: 'News created', newsId: result.insertId });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ensure 'uploads' folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Ensure 'uploads' folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Ensure 'uploads' directory exists for storing images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

//Update News By ID
app.put('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  const { image, title, paragraph } = req.body;

  // Ensure the id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID, must be a number' });
  }

  try {
    const query =
      'UPDATE news SET image = ?, title = ?, paragraph = ? WHERE id = ?';
    const [result] = await connection.query(query, [
      image,
      title,
      paragraph,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News updated' });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Delete news by ID
app.delete('/api/news/:id', async (req, res) => {
  const { id } = req.params;
  // Ensure the id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID, must be a number' });
  }

  try {
    const query = 'DELETE FROM news WHERE id = ?';
    const [result] = await connection.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to check if a user has banned another user
app.get('/api/users/:user_id/isBanned/:banned_user_id', async (req, res) => {
  const { user_id, banned_user_id } = req.params;

  // Check if user_id and banned_user_id are valid numbers
  if (isNaN(user_id) || isNaN(banned_user_id)) {
    return res.status(400).json({ error: 'Invalid user or banned user ID' });
  }

  try {
    // Query to check if the user has banned the banned_user_id
    const query = `
      SELECT 1 
      FROM banned_users 
      WHERE user_id = ? AND banned_user_id = ?
      LIMIT 1
    `;

    const [result] = await connection.query(query, [user_id, banned_user_id]);

    // If result is found, the user is banned
    const isBanned = result.length > 0;

    // Respond with the ban status
    res.json({ isBanned });
  } catch (error) {
    console.error('Error checking ban status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/movies/:id/reviews-summary', async (req, res) => {
  const movieId = req.params.id;
  const userId = req.query.userId; // Optional, based on whether the user is logged in or not

  try {
    // Base query for total reviews and true average rating for the movie
    let totalReviewsQuery = `
      SELECT 
        COUNT(*) AS total_reviews, 
        ROUND(AVG(rating), 2) AS average_rating 
      FROM 
        movie_reviews 
      WHERE 
        movie_id = ?
    `;

    const [totalReviewsResult] = await connection.query(totalReviewsQuery, [
      movieId,
    ]);

    if (totalReviewsResult.length === 0) {
      return res.status(404).json({ error: 'No reviews found for this movie' });
    }

    let result = {
      total_reviews: totalReviewsResult[0].total_reviews,
      average_rating: totalReviewsResult[0].average_rating || 0,
    };

    // If user is logged in, we need to adjust the result based on banned users
    if (userId) {
      // Query to exclude reviews from banned users for the logged-in user
      const reviewsExcludingBannedQuery = `
        SELECT 
          COUNT(*) AS total_reviews, 
          ROUND(AVG(rating), 2) AS average_rating 
        FROM 
          movie_reviews 
        WHERE 
          movie_id = ? 
          AND user_id NOT IN (
            SELECT banned_user_id 
            FROM banned_users 
            WHERE user_id = ?
          )
      `;

      const [filteredReviewsResult] = await connection.query(
        reviewsExcludingBannedQuery,
        [movieId, userId]
      );

      result = {
        total_reviews: filteredReviewsResult[0].total_reviews,
        average_rating: filteredReviewsResult[0].average_rating || 0,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching movie reviews summary:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

// Mark for deletion
app.post('/api/movies/mark-for-deletion/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    // Set the deletion date to 7 days from now
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 7);

    const query = `
      UPDATE movies 
      SET marked_for_deletion = TRUE, deletion_date = ? 
      WHERE movie_id = ?
    `;
    await connection.query(query, [deletionDate, movieId]);

    res.status(200).json({ message: 'Movie marked for deletion', movieId });
  } catch (error) {
    console.error('Error marking movie for deletion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
