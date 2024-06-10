// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

const CustomDocument= () => {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400..800&family=Comfortaa&family=Tilt+Warp&family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
}

export default CustomDocument;
//