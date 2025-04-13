'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
import DayView from '../components/DayView';
import { Container, CssBaseline, Box } from '@mui/material';

export default function Home() {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <DayView />
      </Container>
    </Provider>
  );
}