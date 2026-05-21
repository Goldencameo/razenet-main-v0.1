import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: 'TXN-001',
    type: 'purchase',
    description: 'RZ Package Purchase',
    amount: 49.99,
    currency: 'USD',
    rzAmount: 5000,
    status: 'completed',
    date: '2024-01-15T10:30:00Z',
    method: 'Credit Card',
  },
  {
    id: 'TXN-002',
    type: 'subscription',
    description: 'Premium Plan Subscription',
    amount: 9.99,
    currency: 'USD',
    status: 'completed',
    date: '2024-01-10T14:20:00Z',
    method: 'Credit Card',
  },
  {
    id: 'TXN-003',
    type: 'purchase',
    description: 'Marketplace Item: Cyber Avatar Skin',
    amount: 499,
    currency: 'RZ',
    status: 'completed',
    date: '2024-01-08T09:15:00Z',
    method: 'RZ Balance',
  },
  {
    id: 'TXN-004',
    type: 'purchase',
    description: 'Marketplace Item: Golden Crown',
    amount: 299,
    currency: 'RZ',
    status: 'completed',
    date: '2024-01-05T16:45:00Z',
    method: 'RZ Balance',
  },
  {
    id: 'TXN-005',
    type: 'purchase',
    description: 'RZ Package Purchase',
    amount: 19.99,
    currency: 'USD',
    rzAmount: 2000,
    status: 'completed',
    date: '2024-01-01T11:00:00Z',
    method: 'Credit Card',
  },
  {
    id: 'TXN-006',
    type: 'subscription',
    description: 'Premium Plan Subscription',
    amount: 9.99,
    currency: 'USD',
    status: 'completed',
    date: '2023-12-15T14:20:00Z',
    method: 'Credit Card',
  },
];

export default function Transactions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'subscription':
        return '⭐';
      case 'refund':
        return '💰';
      default:
        return '📄';
    }
  };

  const totalSpentUSD = transactions
    .filter(t => t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpentRZ = transactions
    .filter(t => t.currency === 'RZ')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          </div>
          <p className="text-muted-foreground">
            View your purchase history and transaction details
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">${totalSpentUSD.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent (RZ)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{totalSpentRZ.toLocaleString()} RZ</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Transactions</option>
              <option value="purchase">Purchases</option>
              <option value="subscription">Subscriptions</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No transactions found</p>
                <Button onClick={() => { setFilter('all'); setSearchQuery(''); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                      <div>
                        <p className="font-semibold text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.id} · {formatDate(transaction.date)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Method: {transaction.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {transaction.currency === 'USD' ? `$${transaction.amount.toFixed(2)}` : `${transaction.amount.toLocaleString()} RZ`}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
