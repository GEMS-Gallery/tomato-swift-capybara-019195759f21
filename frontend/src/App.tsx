import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress, IconButton, Grid, AppBar, Toolbar } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { backend } from 'declarations/backend';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RepeatIcon from '@mui/icons-material/Repeat';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    initAuth();
    fetchTweets();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error initializing authentication:', error);
    }
  };

  const login = async () => {
    if (authClient) {
      try {
        await authClient.login({
          identityProvider: 'https://identity.ic0.app/#authorize',
          onSuccess: async () => {
            setIsAuthenticated(true);
            await fetchUserProfile();
          },
        });
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  };

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
    if (authClient) {
      try {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        const result = await backend.getUserProfile(principal);
        if ('ok' in result) {
          setUserProfile(result.ok);
        } else {
          console.error('Error fetching user profile:', result.err);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const onSubmit = async (data: { content: string }) => {
    if (!isAuthenticated) {
      console.error('User must be authenticated to post a tweet');
      return;
    }
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
    if (!isAuthenticated) {
      console.error('User must be authenticated to like a tweet');
      return;
    }
    try {
      await backend.likeTweet(tweetId);
      await fetchTweets();
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };

  const handleRetweet = async (tweetId: bigint) => {
    if (!isAuthenticated) {
      console.error('User must be authenticated to retweet');
      return;
    }
    try {
      await backend.retweet(tweetId);
      await fetchTweets();
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };

  const handleFollow = async (userToFollow: string) => {
    if (!isAuthenticated) {
      console.error('User must be authenticated to follow another user');
      return;
    }
    try {
      await backend.followUser(Principal.fromText(userToFollow));
      await fetchUserProfile();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            V0 Twitter Clone
          </Typography>
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={login}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ my: 4 }}>
              <Typography variant="h6" gutterBottom>
                User Profile
              </Typography>
              {userProfile ? (
                <>
                  <Typography variant="subtitle1">{userProfile.username || 'No username set'}</Typography>
                  <Typography variant="body2">{userProfile.bio || 'No bio set'}</Typography>
                  <Typography variant="body2">Following: {userProfile.following?.length || 0}</Typography>
                  <Typography variant="body2">Followers: {userProfile.followers?.length || 0}</Typography>
                </>
              ) : (
                <Typography variant="body2">No profile found</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ my: 4 }}>
              {isAuthenticated && (
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
              )}
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
                      <IconButton onClick={() => handleLike(tweet.id)} disabled={!isAuthenticated}>
                        <FavoriteIcon />
                      </IconButton>
                      <Typography variant="caption">{tweet.likes.toString()}</Typography>
                      <IconButton onClick={() => handleRetweet(tweet.id)} disabled={!isAuthenticated}>
                        <RepeatIcon />
                      </IconButton>
                      <Typography variant="caption">{tweet.retweets.toString()}</Typography>
                      <IconButton onClick={() => handleFollow(tweet.author)} disabled={!isAuthenticated}>
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
    </>
  );
};

export default App;
