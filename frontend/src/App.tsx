import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { backend } from 'declarations/backend';

type Tweet = {
  id: bigint;
  content: string;
  userId: string;
  timestamp: bigint;
};

type UserProfile = {
  userId: string;
  name: string;
  bio: string;
};

const App: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchTweets();
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

  const onSubmit = async (data: { content: string }) => {
    setLoading(true);
    try {
      const result = await backend.createTweet(data.content, 'user123');
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

  return (
    <Container maxWidth="sm">
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
                  secondary={`@user123 - ${new Date(Number(tweet.timestamp) / 1000000).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default App;
