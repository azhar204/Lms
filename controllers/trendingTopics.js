import { Router } from "express";
import axios from "axios";

export const TrendingTopics= async (req, res) => {
  try {
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID,
          password: process.env.REDDIT_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    const postsResponse = await axios.get(
      "https://oauth.reddit.com/r/technology+programming+technews/hot",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "LMS-App/1.0",
        },
        params: {
          limit: 20, 
        },
      }
    );

    const decodeHtmlEntities = (str) => {
      return str.replace(/&amp;/g, "&");
    };

    const posts = postsResponse.data.data.children.map((post) => ({
      id: post.data.id,
      title: post.data.title,
      subreddit: post.data.subreddit,
      url: post.data.url,
      thumbnail: post.data.preview?.images?.[0]?.source?.url
        ? decodeHtmlEntities(post.data.preview.images[0].source.url)
        : (post.data.thumbnail.startsWith("http") ? post.data.thumbnail : null),
      upvotes: post.data.ups,
      comments: post.data.num_comments,
    }));
    
    res.status(200).json({ posts });
  } catch (error) {
    console.error("Reddit API error:", error.message);
    res.status(500).json({ message: "Failed to fetch trending tech topics", error: error.message });
  }
}

