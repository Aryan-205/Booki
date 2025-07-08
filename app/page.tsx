"use client"
import React, { useState, useEffect } from 'react';

// TypeScript interfaces
interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  votes: number;
  coverUrl: string;
  dateAdded: string;
  userVotes: { [userId: string]: number }; // -1, 0, or 1
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface BookFormData {
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl: string;
}

const Home: React.FC = () => {
  // Mock current user - in real app this would come from auth
  const currentUser: User = {
    id: 'user1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  };

  const [books, setBooks] = useState<Book[]>([
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genre: "Fiction",
      description: "A classic American novel exploring themes of wealth, love, and the American Dream in the Jazz Age.",
      votes: 42,
      coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
      dateAdded: "2024-01-15",
      userVotes: { 'user2': 1, 'user3': 1, 'user4': -1 }
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: "Fiction",
      description: "A powerful story of racial injustice and moral growth in the American South.",
      votes: 38,
      coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
      dateAdded: "2024-01-10",
      userVotes: { 'user2': 1, 'user3': 1 }
    },
    {
      id: 3,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      genre: "Non-Fiction",
      description: "A fascinating exploration of human history and the forces that shaped our species.",
      votes: 35,
      coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
      dateAdded: "2024-01-12",
      userVotes: { 'user2': 1, 'user4': 1 }
    },
    {
      id: 4,
      title: "Dune",
      author: "Frank Herbert",
      genre: "Science Fiction",
      description: "An epic space opera set on the desert planet Arrakis, exploring politics, religion, and ecology.",
      votes: 31,
      coverUrl: "https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop",
      dateAdded: "2024-01-08",
      userVotes: { 'user3': 1, 'user4': 1 }
    }
  ]);

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');

  const genres: string[] = ['All', 'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Biography', 'History', 'Romance', 'Thriller'];

  const [newBook, setNewBook] = useState<BookFormData>({
    title: '',
    author: '',
    genre: 'Fiction',
    description: '',
    coverUrl: ''
  });

  // Sort books based on selected criteria
  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    } else {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });

  // Filter books by genre and search term
  const filteredBooks = sortedBooks.filter(book => {
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleVote = (bookId: number, voteType: 'up' | 'down'): void => {
    setBooks(books.map(book => {
      if (book.id === bookId) {
        const currentUserVote = book.userVotes[currentUser.id] || 0;
        const newUserVotes = { ...book.userVotes };
        let voteDifference = 0;

        if (voteType === 'up') {
          if (currentUserVote === 1) {
            // Remove upvote
            delete newUserVotes[currentUser.id];
            voteDifference = -1;
          } else {
            // Add upvote (and remove downvote if exists)
            newUserVotes[currentUser.id] = 1;
            voteDifference = currentUserVote === -1 ? 2 : 1;
          }
        } else {
          if (currentUserVote === -1) {
            // Remove downvote
            delete newUserVotes[currentUser.id];
            voteDifference = 1;
          } else {
            // Add downvote (and remove upvote if exists)
            newUserVotes[currentUser.id] = -1;
            voteDifference = currentUserVote === 1 ? -2 : -1;
          }
        }

        return { 
          ...book, 
          votes: book.votes + voteDifference,
          userVotes: newUserVotes
        };
      }
      return book;
    }));
  };

  const handleAddBook = (): void => {
    if (newBook.title && newBook.author) {
      const book: Book = {
        id: Date.now(),
        ...newBook,
        votes: 0,
        dateAdded: new Date().toISOString().split('T')[0],
        coverUrl: newBook.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
        userVotes: {}
      };
      setBooks([...books, book]);
      setNewBook({ title: '', author: '', genre: 'Fiction', description: '', coverUrl: '' });
      setShowAddForm(false);
    }
  };

  const handleEditBook = (book: Book): void => {
    setEditingBook(book);
    setNewBook({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      coverUrl: book.coverUrl
    });
    setShowAddForm(true);
  };

  const handleUpdateBook = (): void => {
    if (editingBook && newBook.title && newBook.author) {
      setBooks(books.map(book => 
        book.id === editingBook.id 
          ? { ...book, ...newBook }
          : book
      ));
      setEditingBook(null);
      setNewBook({ title: '', author: '', genre: 'Fiction', description: '', coverUrl: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteBook = (bookId: number): void => {
    setBooks(books.filter(book => book.id !== bookId));
  };

  const resetForm = (): void => {
    setNewBook({ title: '', author: '', genre: 'Fiction', description: '', coverUrl: '' });
    setEditingBook(null);
    setShowAddForm(false);
  };

  const getCurrentUserVote = (book: Book): number => {
    return book.userVotes[currentUser.id] || 0;
  };

  const getVoteStats = (book: Book): { upvotes: number; downvotes: number } => {
    const upvotes = Object.values(book.userVotes).filter(vote => vote === 1).length;
    const downvotes = Object.values(book.userVotes).filter(vote => vote === -1).length;
    return { upvotes, downvotes };
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black shadow-sm border-b border-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">BookRank</h1>
                <p className="text-gray-300 text-sm">Community Book Rankings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-200 font-medium">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search books or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-2 border border-gray-300 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'votes' | 'recent')}
                  className="px-4 py-2 border border-gray-300 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="votes">Sort by Votes</option>
                  <option value="recent">Sort by Recent</option>
                </select>
              </div>
            </div>

            {/* Add Book Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <span className="text-lg">+</span>
              Add Book
            </button>
          </div>
        </div>

        {/* Add/Edit Book Form */}
        {showAddForm && (
          <div className="mb-8 bg-black rounded-lg shadow-sm border border-white p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Author</label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    className="w-full p-3 border border-gray-300 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter author name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                  <select
                    value={newBook.genre}
                    onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {genres.slice(1).map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cover Image</label>
                  <input
                    type="file"
                    value={newBook.coverUrl}
                    onChange={(e) => setNewBook({...newBook, coverUrl: e.target.value})}
                    className="w-full p-3 border border-gray-300 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Enter book description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={editingBook ? handleUpdateBook : handleAddBook}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => {
            const userVote = getCurrentUserVote(book);
            const { upvotes, downvotes } = getVoteStats(book);
            
            return (
              <div key={book.id} className="bg-black rounded-lg shadow-sm border border-white hover:shadow-md transition-shadow">
                {/* Ranking Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                    #{index + 1}
                  </div>
                </div>

                {/* Book Cover */}
                <div className="relative h-64 bg-gray-100 rounded-t-lg border overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop";
                    }}
                  />
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-gray-100 text-sm mb-2">by {book.author}</p>
                    <span className="inline-block border text-gray-100 px-2 py-1 rounded text-xs">
                      {book.genre}
                    </span>
                  </div>

                  <p className="text-gray-200 text-sm mb-4 line-clamp-2">{book.description}</p>

                  {/* Voting Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleVote(book.id, 'up')}
                        className={`p-2 rounded-full transition-colors ${
                          userVote === 1 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
                        </svg>
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-gray-200">{book.votes}</span>
                        <span className="text-xs text-gray-500">{upvotes}↑ {downvotes}↓</span>
                      </div>
                      <button
                        onClick={() => handleVote(book.id, 'down')}
                        className={`p-2 rounded-full transition-colors ${
                          userVote === -1 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
                        </svg>
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBook(book)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No books found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedGenre !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Be the first to add a book to the platform!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;