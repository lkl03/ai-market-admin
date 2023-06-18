/* eslint-disable react/jsx-no-target-blank */
import { React, useState } from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";



import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";

export default function Index() {

  const router = useRouter();
  const [phrase, setPhrase] = useState('');

  // Get seed phrase from environment variable
  const correctPhrase = process.env.NEXT_PUBLIC_SEED_PHRASE;

  const handlePhraseChange = e => {
    setPhrase(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (phrase.trim() === correctPhrase) {
      // save the seed phrase to sessionStorage
      sessionStorage.setItem('seedPhrase', phrase);
      // redirect to admin dashboard
      router.push('/admin/dashboard');
    } else {
      alert('Incorrect seed phrase. Please try again.');
    }
  };

  return (
    <>
      <IndexNavbar fixed />
      <section className="header relative pt-16 items-center flex h-screen max-h-860-px">
        <div className="container mx-auto items-center flex flex-wrap">
          <div className="w-full md:w-8/12 lg:w-6/12 xl:w-6/12 px-4">
            <div className="pt-32 sm:pt-0">
              <h2 className="font-semibold text-4xl text-blueGray-600">
                Welcome!
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-blueGray-500 mb-2">
                Enter the 12 seed phrase below to access the admin panel.
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={phrase}
                  onChange={handlePhraseChange}
                />
                <div className="mt-8">
                  <button
                    type="submit"
                    className="get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-400 active:bg-blueGray-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <img
          className="absolute top-0 b-auto right-0 pt-16 sm:w-6/12 -mt-48 sm:mt-0 w-10/12 max-h-860-px"
          src="/img/pattern_nextjs.png"
          alt="..."
        />
      </section>

      <Footer />
    </>
  );
}
