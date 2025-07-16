import React, { useState, useEffect } from 'react';

const apiService = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  
  getHeaders: function() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? 'Bearer ' + token : ''
    };
  },

  getUserProfile: async function() {
    try {
      const response = await fetch(apiService.baseURL + '/user/profile', {
        method: 'GET',
        headers: apiService.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  getTaxReturns: async function() {
    try {
      const response = await fetch(apiService.baseURL + '/tax-returns', {
        method: 'GET',
        headers: apiService.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tax returns: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tax returns:', error);
      throw error;
    }
  },
  
  getDocuments: async function() {
    try {
      const response = await fetch(apiService.baseURL + '/documents', {
        method: 'GET',
        headers: apiService.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  uploadDocument: async function(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(apiService.baseURL + '/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? 'Bearer ' + token : ''
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  
  createTaxReturn: async function(data) {
    try {
      const response = await fetch(apiService.baseURL + '/tax-returns', {
        method: 'POST',
        headers: apiService.getHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tax return: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating tax return:', error);
      throw error;
    }
  },
  
  updateTaxReturn: async function(id, data) {
    try {
      const response = await fetch(apiService.baseURL + '/tax-returns/' + id, {
        method: 'PUT',
        headers: apiService.getHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tax return: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating tax return:', error);
      throw error;
    }
  },
  
  deleteDocument: async function(id) {
    try {
      const response = await fetch(apiService.baseURL + '/documents/' + id, {
        method: 'DELETE',
        headers: apiService.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxReturns, setTaxReturns] = useState([]);
  const [documents, setDocuments] = useState([]);

  const handleLogout = function() {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      setUser(null);
      setTaxReturns([]);
      setDocuments([]);
      setError(null);
      
      alert('Logging out...');
      window.location.href = '/login';
    }
  };

  useEffect(function() {
    const loadUserAndData = async function() {
      setUserLoading(true);
      setError(null);
      
      try {
        console.log('Loading user profile and data...');
        
        const userProfile = await apiService.getUserProfile();
        console.log('User profile loaded:', userProfile);
        setUser(userProfile);

        setLoading(true);
        
        const taxReturnsData = await apiService.getTaxReturns();
        const documentsData = await apiService.getDocuments();
        
        console.log('Tax returns loaded:', taxReturnsData.length || 0);
        console.log('Documents loaded:', documentsData.length || 0);
        
        setTaxReturns(taxReturnsData || []);
        setDocuments(documentsData || []);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        
        if (err.message.includes('No authentication token found') || err.message.includes('401')) {
          setError('Please log in to access your dashboard.');
        } else {
          setError('Failed to load dashboard data. Please try refreshing the page.');
          setUser({ full_name: 'User', email: 'user@example.com', id: 'demo_user' });
        }
      } finally {
        setLoading(false);
        setUserLoading(false);
      }
    };

    loadUserAndData();
  }, []);

  const safeToNumber = function(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  if (userLoading) {
    return React.createElement('div', {
      style: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #581c87 50%, #1e1b4b 75%, #0f172a 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, React.createElement('div', {
      style: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(6, 182, 212, 0.9))',
        padding: '3rem',
        borderRadius: '2rem',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }
    }, React.createElement('div', {
      style: {
        width: '4rem',
        height: '4rem',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 2rem'
      }
    }), React.createElement('h2', {
      style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }
    }, '🚀 Loading TaxBox.AI'), React.createElement('p', {
      style: { fontSize: '1.25rem', color: '#e2e8f0' }
    }, 'Setting up your personalized dashboard...')));
  }

  const stats = [
    { title: 'Total Returns', value: taxReturns.length, icon: '📄' },
    { 
      title: 'Total Refunds', 
      value: '$' + taxReturns.reduce(function(sum, tr) {
        return sum + safeToNumber(tr.refund_amount);
      }, 0).toLocaleString(), 
      icon: '💰' 
    },
    { 
      title: 'AI Generated', 
      value: taxReturns.filter(function(tr) {
        return tr.auto_generated;
      }).length, 
      icon: '🤖' 
    },
    { title: 'Documents', value: documents.length, icon: '📤' }
  ];

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #581c87 50%, #1e1b4b 75%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }
  }, 
    loading && React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }
    }, React.createElement('div', {
      style: {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(6, 182, 212, 0.9))',
        padding: '2rem',
        borderRadius: '1rem',
        textAlign: 'center'
      }
    }, React.createElement('div', {
      style: {
        width: '3rem',
        height: '3rem',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }
    }), React.createElement('p', {
      style: { fontSize: '1.125rem', fontWeight: '600' }
    }, 'Loading your tax data...'))),

    error && React.createElement('div', {
      style: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '1rem',
        padding: '1rem',
        margin: '1rem',
        color: '#fca5a5',
        textAlign: 'center'
      }
    }, React.createElement('p', {
      style: { fontWeight: '600' }
    }, '⚠️ ' + error), React.createElement('button', {
      onClick: function() { setError(null); },
      style: {
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        marginTop: '0.5rem',
        cursor: 'pointer'
      }
    }, 'Dismiss')),

    React.createElement('div', {
      style: { maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }
    }, 
      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3))',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '2rem',
          padding: '2.5rem',
          marginBottom: '3rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }
      }, 
        React.createElement('h1', {
          style: {
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }
        }, '🚀 TaxBox.AI Dashboard'),
        React.createElement('p', {
          style: {
            fontSize: 'clamp(1.25rem, 3vw, 2rem)',
            color: '#e2e8f0',
            marginBottom: '2rem',
            fontWeight: '600'
          }
        }, 'Welcome ' + (user && user.full_name ? user.full_name : 'User') + '! ✨ Your AI-Powered Tax Filing Experience'),
        
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '1rem 2rem',
            margin: '0 auto',
            maxWidth: 'fit-content',
            gap: '1rem',
            flexWrap: 'wrap'
          }
        }, 
          React.createElement('span', { style: { fontSize: '2rem' } }, '✨'),
          React.createElement('span', { style: { fontWeight: '600', fontSize: '1.25rem' } }, 'Smart Filing'),
          React.createElement('button', {
            onClick: function() { setAutoFilingEnabled(!autoFilingEnabled); },
            style: {
              width: '4rem',
              height: '2rem',
              borderRadius: '1rem',
              border: 'none',
              background: autoFilingEnabled ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : '#6b7280',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }
          }, React.createElement('div', {
            style: {
              width: '1.75rem',
              height: '1.75rem',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '0.125rem',
              left: autoFilingEnabled ? '2.125rem' : '0.125rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }
          })),
          React.createElement('button', {
            style: {
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              borderRadius: '1rem',
              padding: '0.75rem 1.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.875rem'
            },
            onClick: handleLogout
          }, 'Logout')
        )
      ),

      React.createElement('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }
      }, stats.map(function(stat, index) {
        return React.createElement('div', {
          key: index,
          style: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '2rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
          }
        }, 
          React.createElement('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }
          },
            React.createElement('div', {
              style: {
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }
            }, stat.icon),
            React.createElement('span', {
              style: { fontSize: '2rem', color: '#10b981' }
            }, '📈')
          ),
          React.createElement('h3', {
            style: {
              fontSize: '1rem',
              fontWeight: '600',
              color: '#9ca3af',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          }, stat.title),
          React.createElement('p', {
            style: {
              fontSize: '2.5rem',
              fontWeight: '900',
              color: 'white'
            }
          }, stat.value)
        );
      })),

      React.createElement('div', {
        style: {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '2rem',
          padding: '2.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          textAlign: 'center'
        }
      }, 
        React.createElement('p', {
          style: {
            fontSize: '1.125rem',
            color: '#9ca3af',
            marginBottom: '0.5rem'
          }
        }, '🚀 Powered by TaxBox.AI - The Future of Tax Filing'),
        React.createElement('p', {
          style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }
        }, 'Built with ❤️ using React and modern web technologies'),
        user && React.createElement('p', {
          style: { fontSize: '0.75rem', color: '#4b5563' }
        }, 'Logged in as: ' + (user.email || user.full_name) + ' • User ID: ' + user.id)
      )
    ),

    React.createElement('style', {
      dangerouslySetInnerHTML: {
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important;
          }
          
          * {
            box-sizing: border-box;
          }
        `
      }
    })
  );
}

export default Dashboard;
