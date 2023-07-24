import { React, useEffect } from 'react';
import { useRouter } from 'next/router';
import useState from 'react-usestateref';
import Link from "next/link";


// components

import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import CardPageVisits from "components/Cards/CardPageVisits.js";
import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";

// layout for page

import Admin from "layouts/Admin.js";

import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db } from '../../firebase';
import { doc, collection, collectionGroup, getDocs, updateDoc, setDoc, query, where } from 'firebase/firestore'

import Modal from 'react-modal';

import Moment from 'react-moment';


export default function Dashboard() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentProduct, setCurrentProduct, currentProductRef] = useState(null);

  const [dataRejectedEmail, setDataRejectedEmail] = useState([])
  const [dataApprovedEmail, setDataApprovedEmail] = useState([])

  const [userData, setUserData, userDataRef] = useState([])

  useEffect(() => {
    // check if seed phrase is in sessionStorage
    if (!sessionStorage.getItem('seedPhrase')) {
      // if not, redirect to admin login page
      router.push('/');
    }
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const submittedRef = collectionGroup(db, 'submitted');
      const q = query(submittedRef, where('status', '==', 'Approval pending'));
      const querySnapshot = await getDocs(q);
        
      const fetchedData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
  
      setProducts(fetchedData);
      setProductsLoading(false); // Stop the loading spinner
      console.log(fetchedData); // Log fetchedData directly as products state update may not have occurred yet
    }
  
    fetchProducts();
  }, []);

  useEffect(() => {
    if(dataRejectedEmail){
      fetch("../../api/productrejected", {
        "method": "POST",
        "headers": { "content-type": "application/json" },
        "body": JSON.stringify(dataRejectedEmail)
      }).then(response => {
        if (response.ok) {
          // Show alert and reload page
          if (window.confirm('Product rejected!')) {
            window.location.reload();
          }
        } else {
          console.error('Email was not sent', response);
        }
      }).catch(err => console.error(err));
    }
  }, [dataRejectedEmail]);

  useEffect(() => {
    if(dataApprovedEmail){
      fetch("../../api/productapproved", {
        "method": "POST",
        "headers": { "content-type": "application/json" },
        "body": JSON.stringify(dataApprovedEmail)
      }).then(response => {
        if (response.ok) {
          // Show alert and reload page
          if (window.confirm('Product approved!')) {
            window.location.reload();
          }
        } else {
          console.error('Email was not sent', response);
        }
      }).catch(err => console.error(err));
    }
  }, [dataApprovedEmail]);

  const handleProductClick = (product) => {
    setCurrentProduct(product);
    const fetchUserInfo = async () => {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', '==', currentProductRef.current.publisher));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // should be only one document
        const userInfo = {
          id: userDoc.id,
          ...userDoc.data(),
        };
        setUserData(userInfo)
        console.log(userDataRef.current)
      } else {
        return null; // or throw an error
      }
    };
    fetchUserInfo()
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
  };

  const approveProduct = async (product) => {
    const productData = {
      title: currentProduct.title,
      desc: currentProduct.desc,
      thumbnailURL: currentProduct.thumbnailURL,
      productURL: currentProduct.productURL,
      price: currentProduct.price,
      ai: currentProduct.ai,
      terms: currentProduct.terms,
      status: 'Approved',
      isApproved: true,
      productID: currentProduct.productID,
      publicID: currentProduct.publicID,
      publishedDate: currentProduct.publishedDate,
      publisher: currentProduct.publisher,
      totalLikes: currentProduct.totalLikes,
      totalPurchases: currentProduct.totalPurchases,
      parentCollection: currentProduct.parentCollection,
    };

        // Fetch user data based on publisher ID
        const fetchUserInfo = async () => {
          const userRef = collection(db, 'users');
          const q = query(userRef, where('uid', '==', productData.publisher));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // should be only one document
            const userData = {
              id: userDoc.id,
              ...userDoc.data(),
            };
            return userData;
          } else {
            return null; // or throw an error
          }
        };

    // Update doc on the 'submitted' folder
    const docRef = doc(db, productData.parentCollection, productData.publisher, 'submitted', productData.productID);
    await updateDoc(docRef, {
      status: 'Approved',
      isApproved: true,
    });

    //Add doc to the 'approved' folder
    const userDoc = doc(db, productData.parentCollection, productData.publisher, 'approved', productData.productID);
    await setDoc(userDoc, productData);

    // Call fetchUserInfo and update productData.publisher
    const userData = await fetchUserInfo();
    if (userData) {
      productData.publisher = userData.name; // Replace publisher ID with name
      setDataApprovedEmail({
        email: userData.email,
        name: userData.name,
        product: productData.title
      });
    } else {
      console.error('User not found');
      return;
    }
  }

  const rejectProduct = async (product) => {
    const productData = {
      title: currentProduct.title,
      desc: currentProduct.desc,
      thumbnailURL: currentProduct.thumbnailURL,
      productURL: currentProduct.productURL,
      price: currentProduct.price,
      ai: currentProduct.ai,
      terms: currentProduct.terms,
      status: 'Rejected',
      isApproved: false,
      productID: currentProduct.productID,
      publicID: currentProduct.publicID,
      publishedDate: currentProduct.publishedDate,
      publisher: currentProduct.publisher,
      totalLikes: currentProduct.totalLikes,
      totalPurchases: currentProduct.totalPurchases,
      parentCollection: currentProduct.parentCollection,
    };
  
    // Fetch user data based on publisher ID
    const fetchUserInfo = async () => {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', '==', productData.publisher));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // should be only one document
        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
        };
        return userData;
      } else {
        return null; // or throw an error
      }
    };
  
    // Update doc on the 'submitted' folder
    const docRef = doc(db, productData.parentCollection, productData.publisher, 'submitted', productData.productID);
    await updateDoc(docRef, {
      status: 'Rejected',
      isApproved: false,
    });

    //Add doc to the 'rejected' folder
    const userDoc = doc(db, productData.parentCollection, productData.publisher, 'rejected', productData.productID);
    await setDoc(userDoc, productData);

    // Call fetchUserInfo and update productData.publisher
    const userData = await fetchUserInfo();
    if (userData) {
      productData.publisher = userData.name; // Replace publisher ID with name
      setDataRejectedEmail({
        email: userData.email,
        name: userData.name,
        product: productData.title
      });
    } else {
      console.error('User not found');
      return;
    }
  };

  return (
    <>
      <div className="flex-row flex-wrap md:h-auto md:w-full lg:justify-around justify-start items-center 2xl:py-8 2xl:px-36 sm:p-8 p-6 max-2xl:gap-7 max-w-[1920px] m-auto">
      <div className='mt-10 mx-auto px-4'>
      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1280: 3, 1800: 4 }}
                      >
                        <Masonry gutter='2rem'>
                          {products.map((product, index) => (
                            <div key={index} style={{maxWidth: '350px'}} className="max-w-full m-auto cursor-pointer overflow-hidden" onClick={() => handleProductClick(product)}>
                              <div style={{maxWidth: '350px'}} className='relative max-w-full m-auto'>
                                <img src={product.thumbnailURL} alt="Thumbnail" style={{minWidth: '350px', height: '175px', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem'}} className='w-full max-w-full object-cover mt-2 m-auto rounded-t-md' />
                                <div style={{top : '0.5rem', left: '1rem'}} className="absolute bg-white bg-opacity-85 rounded py-1 px-2 text-sm">
                                  <p className="font-semibold uppercase">{product.ai}</p>
                                </div>
                                <div style={{top : '0.5rem', right: '1rem', backgroundColor: '#04E762'}} className="absolute bg-opacity-90 rounded py-1 px-2 text-base">
                                  <p className="font-bold text-black">${product.price}</p>
                                </div>
                              </div>
                              <div style={{maxWidth: '400px', borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem'}} className='py-4 border rounded-b-md bg-black border-black max-w-full m-auto px-4'>
                                <h3 className='capitalize text-lg font-bold text-white truncate'>{product.title}</h3>
                                <p className='italic text-white text-sm line-clamp-3'>{product.desc}</p>
                              </div>
                            </div>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                      {currentProduct && (
                        <Modal isOpen={modalIsOpen} onRequestClose={handleModalClose}>
                          <h2>Title: {currentProduct.title}</h2>
                          <p>Description: {currentProduct.desc}</p>
                          <img src={currentProduct.thumbnailURL} style={{minWidth: '500px', height: '250px'}} className='m-auto' alt="Thumbnail" />
                          <p>Product URL: <a href={`${currentProduct.productURL}`} target='_blank'>{currentProduct.productURL}</a></p>
                          <p>Price: ${currentProduct.price}</p>
                          <p>AI: {currentProduct.ai}</p>
                          <p>Terms: {currentProduct.terms === true ? 'true' : 'false'}</p>
                          <p>Status: {currentProduct.status}</p>
                          <p>isApproved: {currentProduct.isApproved === true ? 'true' : 'false'}</p>
                          <p>ProductID: {currentProduct.productID}</p>
                          <p>PublicID: {currentProduct.publicID}</p>
                          <p>Published Date: <Moment>{currentProduct.publishedDate}</Moment></p>
                          <p>Publisher: {currentProduct.publisher}</p>
                          <p>Total Likes: {currentProduct.totalLikes}</p>
                          <p>Total Purchases: {currentProduct.totalPurchases}</p>
                          <p>Parent Collection: {currentProduct.parentCollection}</p>
                          <p>Is PayPal Logged: {userDataRef.current.userIsPaypalLogged === true ? 'true' : 'false'}</p>
                          <p>PayPal Email: {userDataRef.current.paypalEmail}</p>
                          <p>PayPal MerchantID: {userDataRef.current.paypalMerchantID}</p>
                          <button className="mt-4 get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-400 active:bg-blueGray-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150" onClick={() => approveProduct()}>Approve</button>
                          <button className="mt-4 get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-400 active:bg-blueGray-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150" onClick={() => rejectProduct()}>Reject</button>
                          <button className="mt-4 get-started text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-400 active:bg-blueGray-500 uppercase text-sm shadow hover:shadow-lg ease-linear transition-all duration-150" onClick={handleModalClose}>Close</button>
                        </Modal>
                      )}
      </div>
      </div>
    </>
  );
}

Dashboard.layout = Admin;
