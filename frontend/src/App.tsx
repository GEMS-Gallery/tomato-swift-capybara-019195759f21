import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress, IconButton, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { backend } from 'declarations/backend';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RepeatIcon from '@mui/icons-material/Repeat';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

type Tweet = {
  id: bigint;
  content: string;
  author: string;
  timestamp: bigint;
  likes: bigint;
  retweets: bigint;
};

type UserProfile = {
  userId: string;
  username: string;
  bio: string;
  following: string[];
  followers: string[];
};

const App: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchTweets();
    fetchUserProfile();
  }, []);

  const fetchTweets = async () => {
    try {
      const fetchedTweets = await backend.getAllTweets();
      setTweets(fetchedTweets);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const principal = await (window as any).ic.plug.getPrincipal();
      const profile = await backend.getUserProfile(principal);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const onSubmit = async (data: { content: string }) => {
    setLoading(true);
    try {
      const result = await backend.createTweet(data.content);
      if ('ok' in result) {
        await fetchTweets();
        reset();
      } else {
        console.error('Error creating tweet:', result.err);
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
    }
    setLoading(false);
  };

  const handleLike = async (tweetId: bigint) => {
    try {
      await backend.likeTweet(tweetId);
      await fetchTweets();
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };

  const handleRetweet = async (tweetId: bigint) => {
    try {
      await backend.retweet(tweetId);
      await fetchTweets();
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };

  const handleFollow = async (userToFollow: string) => {
    try {
      await backend.followUser(userToFollow);
      await fetchUserProfile();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              User Profile
            </Typography>
            {userProfile ? (
              <>
                <Typography variant="subtitle1">{userProfile.username}</Typography>
                <Typography variant="body2">{userProfile.bio}</Typography>
                <Typography variant="body2">Following: {userProfile.following.length}</Typography>
                <Typography variant="body2">Followers: {userProfile.followers.length}</Typography>
              </>
            ) : (
              <Typography variant="body2">No profile found</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              V0 Twitter Clone
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="content"
                control={control}
                defaultValue=""
                rules={{ required: true, maxLength: 280 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="What's happening?"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                  />
                )}
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                Tweet
              </Button>
            </form>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ mt: 2 }}>
                {tweets.map((tweet) => (
                  <ListItem key={tweet.id.toString()} divider>
                    <ListItemText
                      primary={tweet.content}
                      secondary={`@${tweet.author} - ${new Date(Number(tweet.timestamp) / 1000000).toLocaleString()}`}
                    />
                    <IconButton onClick={() => handleLike(tweet.id)}>
                      <FavoriteIcon />
                    </IconButton>
                    <Typography variant="caption">{tweet.likes.toString()}</Typography>
                    <IconButton onClick={() => handleRetweet(tweet.id)}>
                      <RepeatIcon />
                    </IconButton>
                    <Typography variant="caption">{tweet.retweets.toString()}</Typography>
                    <IconButton onClick={() => handleFollow(tweet.author)}>
                      <PersonAddIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
