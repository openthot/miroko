import './globals.css'
import Tracker from '../components/Tracker'

export const metadata = {
  title: 'Miroko - Producer Management',
  description: 'Manage tasks, payments, and communications with your producers on Miroko.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Tracker />
        {children}
      </body>
    </html>
  )
}
