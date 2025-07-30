import '../app/globals.css';
import ApolloWrapper from '../components/ApolloWrapper';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Tour Booking App',
  description: 'Book amazing tours easily'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black"> {/* ✅ Đặt nền trắng và chữ đen */}
        <ApolloWrapper>
          <AuthProvider>
            <Header />
            <main className="min-h-screen p-4">{children}</main>
            <Footer />
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
