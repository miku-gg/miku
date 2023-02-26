import 'colors';
import app from './app'
const PORT = process.env.SERVICES_PORT || 8484;

app.listen(PORT, () => {
  console.log('Services server running in: ' + `http://localhost:${PORT}`.green);
});