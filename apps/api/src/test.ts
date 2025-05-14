// Simple test file to check imports
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';

console.log('JwtAuthGuard:', JwtAuthGuard);
console.log('LocalAuthGuard:', LocalAuthGuard);

console.log('Test file executed successfully!');
