import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, useScroll, useTransform } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE;

const IdeasList = () => {
  const [ideas, setIdeas] = useState([]);
  const [page, setPage] = useState(() => parseInt(localStorage.getItem('page')) || 1);
  const [pageSize, setPageSize] = useState(() => parseInt(localStorage.getItem('pageSize')) || 10);
  const [sort, setSort] = useState(() => localStorage.getItem('sort') || '-published_at');
  const [totalItems, setTotalItems] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const bannerImage = '/images/header-ideas.jpg'; // Ganti sesuai path banner kamu

  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(!(window.scrollY > lastScrollY.current && window.scrollY > 100));
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('page', page);
    localStorage.setItem('pageSize', pageSize);
    localStorage.setItem('sort', sort);
    fetchIdeas();
  }, [page, pageSize, sort]);

  const fetchIdeas = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/ideas`, {
        params: {
          'page[number]': page,
          'page[size]': pageSize,
          sort,
          append: ['small_image', 'medium_image'],
        },
        headers: {
          Accept: 'application/json',
        },
      });

      setIdeas(res.data.data || []);
      setTotalItems(res.data.meta?.total || 0);
    } catch (error) {
      console.error('🔥 Error fetching ideas:', error);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex flex-col items-center w-full">
      {/* HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${showHeader ? 'bg-white/80 backdrop-blur' : '-translate-y-full'}`}>
        <div className="flex justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="text-orange-500 font-bold text-lg">Suitmedia</div>
          <nav className="space-x-4">
            {['Work', 'About', 'Services', 'Ideas', 'Careers', 'Contact'].map((menu) => (
              <a
                key={menu}
                href="#"
                className={`text-gray-700 hover:text-orange-500 ${
                  menu === 'Ideas' ? 'text-orange-500 border-b-2 border-orange-500' : ''
                }`}
              >
                {menu}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* BANNER */}
      <motion.div
        style={{
          y,
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="w-full h-[300px] relative mt-[60px]"
      >
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center">
          <h1 className="text-white text-4xl font-bold">Ideas</h1>
          <p className="text-white text-lg mt-2">Where all our great things begin.</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-10 bg-white rotate-2 origin-top-left"></div>
      </motion.div>

      {/* CONTENT */}
      <div className="max-w-6xl w-full px-4 py-8">
        {/* Filter */}
        <div className="flex justify-between items-center mb-4">
          <div>
            Showing {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, totalItems)} of {totalItems}
          </div>
          <div className="flex space-x-2 items-center">
            <label>Show per page:</label>
            <select value={pageSize} onChange={handlePageSizeChange} className="border rounded p-1">
              {[10, 20, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <label>Sort by:</label>
            <select value={sort} onChange={handleSortChange} className="border rounded p-1">
              <option value="-published_at">Newest</option>
              <option value="published_at">Oldest</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ideas.map((idea) => {
            const imagePath = idea.small_image?.data?.url || idea.medium_image?.data?.url;
            const imageUrl = typeof imagePath === 'string' ? `${API_BASE}${imagePath}` : null;

            return (
              <div key={idea.id} className="rounded shadow p-2 bg-white">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={idea.title}
                    loading="lazy"
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded text-gray-500 text-sm">
                    Gambar tidak tersedia
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  {new Date(idea.published_at).toLocaleDateString()}
                </div>
                <div className="font-semibold text-base line-clamp-3">{idea.title}</div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 space-x-2">
          {/* First */}
          <button
            onClick={() => setPage(1)}
            className={`px-3 py-1 text-sm rounded border ${
              page === 1 ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-gray-700 hover:text-orange-500'
            }`}
            disabled={page === 1}
          >
            «
          </button>

          {/* Prev */}
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            className={`px-3 py-1 text-sm rounded border ${
              page === 1 ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-gray-700 hover:text-orange-500'
            }`}
            disabled={page === 1}
          >
            ‹
          </button>

          {/* Numbers */}
          {[...Array(totalPages).keys()]
            .filter((num) => Math.abs(num + 1 - page) <= 2)
            .map((num) => (
              <button
                key={num}
                onClick={() => setPage(num + 1)}
                className={`px-3 py-1 text-sm border rounded ${
                  page === num + 1
                    ? 'text-orange-500 font-bold border-orange-300'
                    : 'text-gray-600 hover:text-orange-500 border-gray-300'
                }`}
              >
                {num + 1}
              </button>
            ))}

          {/* Next */}
          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            className={`px-3 py-1 text-sm rounded border ${
              page === totalPages ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-gray-700 hover:text-orange-500'
            }`}
            disabled={page === totalPages}
          >
            ›
          </button>

          {/* Last */}
          <button
            onClick={() => setPage(totalPages)}
            className={`px-3 py-1 text-sm rounded border ${
              page === totalPages ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-gray-700 hover:text-orange-500'
            }`}
            disabled={page === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeasList;
