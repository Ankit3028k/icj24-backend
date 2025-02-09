import VideoNews from '../Models/FeaturedVideo.js'; // Assuming the model is saved in 'models/FeaturedVideo.js'

// 1. POST a new news video (title and video URL)
export const createNewsVideo = async (req, res) => {
    const { title, video } = req.body;

    if (!title || !video) {
        return res.status(400).json({ message: 'Title and video URL are required' });
    }

    try {
        const newVideoNews = new VideoNews({
            title,
            video,
        });

        await newVideoNews.save();
        res.status(201).json({ message: 'News video created successfully', videoNews: newVideoNews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while creating news video' });
    }
};

// 2. GET all news videos
export const getNewsVideos = async (req, res) => {
    try {
        const newsVideos = await VideoNews.find();  // Changed 'News' to 'VideoNews'
        res.status(200).json(newsVideos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching news videos' });
    }
};
