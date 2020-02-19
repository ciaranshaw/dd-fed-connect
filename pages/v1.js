import React from 'react';
import Head from 'next/head';

import BackupContainer from '../components/v1/BackupContainer';

const Home = () => (
  <div>
    <Head>
      <title>Backup</title>
    </Head>
    <BackupContainer />
    <style jsx global>{`
        body {
            font-family: 'Arial';
        }
    `}</style>
  </div>
)

export default Home
