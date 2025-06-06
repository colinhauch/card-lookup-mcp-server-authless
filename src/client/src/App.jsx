import { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper,
  Stack, Grid, CircularProgress, FormControl,
  InputLabel, Select, MenuItem, Pagination
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';

export default function App() {
  const [input, setInput] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [page, setPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [lastQuery, setLastQuery] = useState('');
  const [cardsPerPage, setCardsPerPage] = useState(20);
  const [interpretation, setInterpretation] = useState('');
  
  const maxPages = Math.ceil(totalCards / cardsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);
    setError(null);
    setPage(1);
    setLastQuery(input);
    setInterpretation('');

    try {
      // Connect to the MCP server
      const response = await fetch('/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Start listening for SSE events
      const eventSource = new EventSource('/sse');
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'text') {
          setInterpretation(data.content);
        } else if (data.type === 'cards') {
          setCards(data.cards);
          setTotalCards(data.total || data.cards.length);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePageChange = async (_, value) => {
    setPage(value);
    setLoading(true);
    try {
      const response = await fetch('/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: lastQuery,
          page: value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container 
        maxWidth={false} 
        disableGutters
        sx={{ 
          backgroundColor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: { xs: 2, sm: 3 }
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
          maxWidth="1200px"
          mx="auto"
          minHeight="100vh"
          pt={4}
          gap={3}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            Oracle
          </Typography>
          
          <Box width="100%" maxWidth="600px">
            <form onSubmit={handleSubmit} style={{ width: '100%', marginBottom: '1rem' }}>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask about Magic cards..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  required
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                />
                <Button type="submit" variant="contained">Send</Button>
              </Box>
            </form>

            <Paper 
              sx={{ 
                p: 2, 
                mb: 2, 
                backgroundColor: 'background.paper',
                width: '100%'
              }}
            >
              <Stack spacing={1}>
                <Typography>
                  {loading ? 'Consulting the cards...' : 
                   error ? error :
                   submitted ? 'Your divination results appear below...' : 
                   'Enter your query to begin divination'}
                </Typography>
                {interpretation && (
                  <Typography variant="body2" color="text.secondary">
                    {interpretation}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Box>

          {loading && (
            <Box display="flex" justifyContent="center" width="100%" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && submitted && cards.length === 0 && (
            <Paper 
              sx={{ 
                p: 3,
                mb: 2,
                backgroundColor: 'background.paper',
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No cards found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search terms or check for typos
              </Typography>
            </Paper>
          )}

          {!loading && cards.length > 0 && (
            <Box width="100%" id="results-top">
              <Stack spacing={2}>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  spacing={2} 
                  mb={2}
                >
                  <Typography variant="body1">
                    Showing {((page - 1) * cardsPerPage) + 1}-{Math.min(page * cardsPerPage, totalCards)} of {totalCards} cards
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small">
                      <InputLabel>Cards per page</InputLabel>
                      <Select
                        value={cardsPerPage}
                        label="Cards per page"
                        onChange={(e) => {
                          setCardsPerPage(e.target.value);
                        }}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value={20}>20 cards</MenuItem>
                        <MenuItem value={50}>50 cards</MenuItem>
                        <MenuItem value={100}>100 cards</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small">
                      <InputLabel>Card size</InputLabel>
                      <Select
                        value={gridSize}
                        label="Card size"
                        onChange={(e) => setGridSize(e.target.value)}
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value={3}>Large</MenuItem>
                        <MenuItem value={4}>Medium</MenuItem>
                        <MenuItem value={6}>Small</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
                
                {maxPages > 1 && (
                  <Box display="flex" justifyContent="center" mb={2}>
                    <Pagination 
                      count={maxPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
                
                <Grid container spacing={2}>
                  {cards.map((card) => (
                    <Grid item xs={12} sm={6} md={12/gridSize} key={card.id}>
                      <Paper
                        onClick={() => window.open(card.scryfallUrl, '_blank')}
                        sx={{
                          pt: '140%',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 3
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={card.imageUrl}
                          alt={card.name}
                          title={`Click to view ${card.name} on Scryfall`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {maxPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination 
                      count={maxPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
