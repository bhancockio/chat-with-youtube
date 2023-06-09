import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import Navbar from "~/components/Navbar";

import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Chat With YouTube</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
};

export default MyApp;
