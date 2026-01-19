import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Copy, CheckCircle, Building2, Mail, Target, TrendingUp, Calendar, Download, Upload } from 'lucide-react';

const AIEmailGenerator = () => {
  // State management
  const [rightsholders, setRightsholders] = useState([]);
  const [activeRightsholder, setActiveRightsholder] = useState(null);
  const [showAddRightsholder, setShowAddRightsholder] = useState(false);
  const [editingRightsholder, setEditingRightsholder] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState(null);
  const [emailDrafts, setEmailDrafts] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState('generator'); // generator, rightsholders, history

  // Initialize with Sporting Kansas City pre-populated
  useEffect(() => {
    const stored = localStorage.getItem('rightsholders');
    if (stored) {
      const parsed = JSON.parse(stored);
      setRightsholders(parsed);
      const active = parsed.find(r => r.active);
      if (active) setActiveRightsholder(active);
    } else {
      // Pre-populate with SKC
      const skcDefault = {
        id: 'skc-001',
        name: 'Sporting Kansas City',
        league: 'MLS',
        sport: 'Soccer',
        active: true,
        created: new Date().toISOString(),
        territory: {
          primary: 'Kansas City metro (2.5M people)',
          extended: '6-state youth academy system (KS, MO, NE, IA, OK, AR)',
          reach: '100,000+ youth players'
        },
        differentiators: [
          'World Cup 2026 host city (Kansas City selected)',
          'Only MLS team with 6-state territorial rights for youth academy',
          'Pinnacle National Training Center (world-class training facility)',
          'Children\'s Mercy Park (18,467 capacity, modern amenities)',
          'Strong midwest market presence with national brand appeal'
        ],
        assets: [
          { type: 'Front-of-kit jersey', status: 'occupied', sponsor: 'Compass Minerals', value: 'Premium' },
          { type: 'Sleeve sponsorship', status: 'available', value: 'High' },
          { type: 'Training kit', status: 'available', value: 'Medium' },
          { type: 'Practice facility naming', status: 'available', value: 'High' },
          { type: 'Youth academy naming', status: 'available', value: 'Premium' }
        ],
        targetCategories: [
          { name: 'Healthcare', priority: 'high', mlsPenetration: '26%', note: 'Top MLS category' },
          { name: 'Financial Services', priority: 'high', mlsPenetration: '26%', note: 'Tied for #1' },
          { name: 'Technology/AI', priority: 'high', mlsPenetration: '0%', note: 'First-mover opportunity' },
          { name: 'Consumer Products', priority: 'medium', mlsPenetration: '30%', note: 'Most active category' }
        ],
        pitchAngles: [
          'World Cup 2026 activation opportunities (global visibility in host city)',
          '6-state territorial reach vs single-market teams',
          'Youth academy = 100,000+ family engagement at scale',
          'Midwest market value for national brands looking beyond coasts',
          'First-mover advantage in emerging categories (especially AI/tech)'
        ],
        currentSponsors: ['Compass Minerals (Industrial - unique in MLS)'],
        approach: 'Fact-based value propositions, company-specific solutions, focus on ROI and business objectives'
      };
      
      setRightsholders([skcDefault]);
      setActiveRightsholder(skcDefault);
      localStorage.setItem('rightsholders', JSON.stringify([skcDefault]));
    }
  }, []);

  // Save rightsholders to localStorage
  const saveRightsholders = (newRightsholders) => {
    setRightsholders(newRightsholders);
    localStorage.setItem('rightsholders', JSON.stringify(newRightsholders));
  };

  // Add new rightsholder
  const addRightsholder = (rightsholder) => {
    const newRightsholder = {
      ...rightsholder,
      id: `rh-${Date.now()}`,
      created: new Date().toISOString(),
      active: false
    };
    saveRightsholders([...rightsholders, newRightsholder]);
    setShowAddRightsholder(false);
  };

  // Update rightsholder
  const updateRightsholder = (id, updates) => {
    const updated = rightsholders.map(r => r.id === id ? { ...r, ...updates } : r);
    saveRightsholders(updated);
    if (activeRightsholder?.id === id) {
      setActiveRightsholder({ ...activeRightsholder, ...updates });
    }
  };

  // Delete rightsholder
  const deleteRightsholder = (id) => {
    if (confirm('Are you sure you want to delete this rightsholder?')) {
      const filtered = rightsholders.filter(r => r.id !== id);
      saveRightsholders(filtered);
      if (activeRightsholder?.id === id) {
        setActiveRightsholder(filtered[0] || null);
      }
    }
  };

  // Set active rightsholder
  const setActive = (id) => {
    const updated = rightsholders.map(r => ({ ...r, active: r.id === id }));
    saveRightsholders(updated);
    setActiveRightsholder(updated.find(r => r.id === id));
  };

  // AI Research & Email Generation
  const generateEmail = async () => {
    if (!companyName.trim() || !activeRightsholder) return;

    setIsResearching(true);
    setResearchResults(null);
    setEmailDrafts(null);

    try {
      // Step 1: Research the company using web search
      const searchQuery = `${companyName} recent news partnership expansion`;
      
      const searchResponse = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Search for news and information about "${companyName}" from the LAST 12 MONTHS ONLY. Focus on: recent announcements, expansions, partnerships, executive changes, funding rounds, business developments, financial results, strategic initiatives. Provide a concise summary of what you find, prioritizing the most recent developments.`
          }],
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search'
          }]
        })
      });

      const searchData = await searchResponse.json();
      
      // Extract research findings
      let researchSummary = '';
      let sources = [];
      
      if (searchData.content) {
        searchData.content.forEach(block => {
          if (block.type === 'text') {
            researchSummary += block.text + '\n';
          }
        });
      }

      setResearchResults({
        company: companyName,
        summary: researchSummary,
        sources: sources,
        timestamp: new Date().toISOString()
      });

      // Step 2: Generate email drafts using research + rightsholder context
      const emailPrompt = `You are a professional sports partnership sales expert. Generate 3 email draft variations for reaching out to ${companyName}.

RESEARCH FINDINGS:
${researchSummary}

RIGHTSHOLDER CONTEXT:
Name: ${activeRightsholder.name}
League: ${activeRightsholder.league}
Territory: ${activeRightsholder.territory.primary}
Extended Reach: ${activeRightsholder.territory.extended}

KEY DIFFERENTIATORS:
${activeRightsholder.differentiators.map((d, i) => `${i + 1}. ${d}`).join('\n')}

PITCH ANGLES:
${activeRightsholder.pitchAngles.map((p, i) => `${i + 1}. ${p}`).join('\n')}

TARGET CATEGORIES:
${activeRightsholder.targetCategories.map(c => `- ${c.name} (${c.priority} priority): ${c.note}`).join('\n')}

SALES APPROACH: ${activeRightsholder.approach}

Generate 3 email variations:
1. CONSERVATIVE: Professional, brief, meeting request focused
2. VALUE-FOCUSED: Emphasizes ROI and business objectives, uses specific differentiators
3. BOLD/CREATIVE: Unique angle, references their recent news, forward-thinking

For each email:
- Subject line
- Body (150-200 words max)
- Why this approach works (2-3 sentences)
- Confidence score (1-10) based on timing and fit

Use the research findings to personalize. Reference specific news/developments when relevant. Connect their business to the rightsholder's differentiators naturally.

CRITICAL: Return ONLY valid JSON with no markdown formatting, no code fences, no extra text. Just the raw JSON object.

Format as JSON:
{
  "conservative": {"subject": "", "body": "", "reasoning": "", "confidence": 0},
  "valueFocused": {"subject": "", "body": "", "reasoning": "", "confidence": 0},
  "bold": {"subject": "", "body": "", "reasoning": "", "confidence": 0},
  "recommendation": "Which approach to use and why"
}`;

      const emailResponse = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: emailPrompt
          }]
        })
      });

      const emailData = await emailResponse.json();
      
      // Parse email drafts
      let draftsText = '';
      if (emailData.content) {
        emailData.content.forEach(block => {
          if (block.type === 'text') {
            draftsText += block.text;
          }
        });
      }

      // Try to parse JSON, fallback to text if fails
      let parsedDrafts;
      try {
        // Remove markdown code fences if present
        let cleanedText = draftsText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Extract JSON object
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedDrafts = JSON.parse(jsonMatch[0]);
          
          // Validate that we have the expected structure
          if (!parsedDrafts.conservative || !parsedDrafts.valueFocused || !parsedDrafts.bold) {
            throw new Error('Invalid JSON structure');
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        console.error('Error parsing email drafts:', e);
        // Fallback structure
        parsedDrafts = {
          conservative: { subject: 'Partnership Opportunity', body: draftsText, reasoning: 'AI-generated draft', confidence: 7 },
          valueFocused: { subject: 'Partnership Opportunity', body: draftsText, reasoning: 'AI-generated draft', confidence: 7 },
          bold: { subject: 'Partnership Opportunity', body: draftsText, reasoning: 'AI-generated draft', confidence: 7 },
          recommendation: 'Review all variations'
        };
      }

      setEmailDrafts(parsedDrafts);

      // Save to history
      const history = JSON.parse(localStorage.getItem('email_history') || '[]');
      history.unshift({
        id: `email-${Date.now()}`,
        company: companyName,
        rightsholder: activeRightsholder.name,
        research: researchSummary,
        drafts: parsedDrafts,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('email_history', JSON.stringify(history.slice(0, 50))); // Keep last 50

    } catch (error) {
      console.error('Error generating email:', error);
      alert('Error generating email. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render functions
  const renderGenerator = () => (
    <div className="space-y-6">
      {/* Active Rightsholder Selection */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Active Rightsholder:</label>
        <select
          value={activeRightsholder?.id || ''}
          onChange={(e) => setActive(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {rightsholders.map(rh => (
            <option key={rh.id} value={rh.id}>
              {rh.name} ({rh.league})
            </option>
          ))}
        </select>
        
        {activeRightsholder && (
          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Territory:</div>
            <div className="text-sm font-medium text-gray-900">{activeRightsholder.territory.extended}</div>
            <div className="text-xs text-gray-600 mt-2">Top Differentiators:</div>
            <ul className="text-xs text-gray-700 ml-4 mt-1 space-y-0.5">
              {activeRightsholder.differentiators.slice(0, 3).map((d, i) => (
                <li key={i}>• {d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Company Research Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          AI-Powered Email Generator
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name:
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Reinhart Foodservice, American Family Insurance, Google Cloud"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && generateEmail()}
            />
          </div>

          <button
            onClick={generateEmail}
            disabled={!companyName.trim() || !activeRightsholder || isResearching}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg shadow-md flex items-center justify-center gap-2"
          >
            {isResearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Researching & Drafting...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Research & Generate Email
              </>
            )}
          </button>
        </div>

        {isResearching && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-900 space-y-1">
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                Searching web for recent {companyName} news...
              </div>
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                Analyzing partnership fit with {activeRightsholder?.name}...
              </div>
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                Generating personalized email drafts...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Research Results */}
      {researchResults && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Research Summary: {researchResults.company}
          </h3>
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
              {researchResults.summary}
            </div>
          </div>
        </div>
      )}

      {/* Email Drafts */}
      {emailDrafts && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-semibold text-green-900">Email Drafts Generated</div>
                <div className="text-sm text-green-700 mt-1">{emailDrafts.recommendation}</div>
              </div>
            </div>
          </div>

          {/* Conservative Draft */}
          <EmailDraftCard
            title="Conservative Approach"
            draft={emailDrafts.conservative}
            color="gray"
            onCopy={copyToClipboard}
            copied={copied}
          />

          {/* Value-Focused Draft */}
          <EmailDraftCard
            title="Value-Focused Approach"
            draft={emailDrafts.valueFocused}
            color="blue"
            onCopy={copyToClipboard}
            copied={copied}
          />

          {/* Bold Draft */}
          <EmailDraftCard
            title="Bold/Creative Approach"
            draft={emailDrafts.bold}
            color="purple"
            onCopy={copyToClipboard}
            copied={copied}
          />
        </div>
      )}
    </div>
  );

  const renderRightsholders = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Rightsholders</h2>
        <button
          onClick={() => setShowAddRightsholder(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rightsholder
        </button>
      </div>

      <div className="grid gap-4">
        {rightsholders.map(rh => (
          <div
            key={rh.id}
            className={`border rounded-lg p-4 ${rh.active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">{rh.name}</h3>
                  {rh.active && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Active</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">{rh.league} • {rh.sport}</div>
                <div className="text-sm text-gray-700 mt-2">{rh.territory.extended}</div>
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-gray-600">Key Differentiators:</div>
                  <ul className="text-xs text-gray-700 ml-4 space-y-0.5">
                    {rh.differentiators.slice(0, 3).map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                    {rh.differentiators.length > 3 && (
                      <li className="text-gray-500">+ {rh.differentiators.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                {!rh.active && (
                  <button
                    onClick={() => setActive(rh.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Set Active
                  </button>
                )}
                <button
                  onClick={() => setEditingRightsholder(rh)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRightsholder(rh.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddRightsholder && (
        <RightsholderForm
          onSave={addRightsholder}
          onCancel={() => setShowAddRightsholder(false)}
        />
      )}

      {editingRightsholder && (
        <RightsholderForm
          rightsholder={editingRightsholder}
          onSave={(updated) => {
            updateRightsholder(editingRightsholder.id, updated);
            setEditingRightsholder(null);
          }}
          onCancel={() => setEditingRightsholder(null)}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partnership Sales AI Agent</h1>
          <p className="text-gray-600">AI-powered research and email generation for sports partnership sales</p>
        </div>

        {/* Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveView('generator')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium ${activeView === 'generator' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email Generator
          </button>
          <button
            onClick={() => setActiveView('rightsholders')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium ${activeView === 'rightsholders' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Rightsholders ({rightsholders.length})
          </button>
        </div>

        {/* Main Content */}
        {activeView === 'generator' && renderGenerator()}
        {activeView === 'rightsholders' && renderRightsholders()}
      </div>
    </div>
  );
};

// Email Draft Card Component
const EmailDraftCard = ({ title, draft, color, onCopy, copied }) => {
  const colorClasses = {
    gray: 'border-gray-300 bg-gray-50',
    blue: 'border-blue-300 bg-blue-50',
    purple: 'border-purple-300 bg-purple-50'
  };

  const confidenceColor = draft.confidence >= 8 ? 'text-green-600' : draft.confidence >= 6 ? 'text-yellow-600' : 'text-red-600';

  const fullEmail = `Subject: ${draft.subject}\n\n${draft.body}`;

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">{title}</h4>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${confidenceColor}`}>
            Confidence: {draft.confidence}/10
          </span>
          <button
            onClick={() => onCopy(fullEmail)}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center gap-1"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Subject:</div>
          <div className="text-sm font-medium text-gray-900 bg-white p-2 rounded border border-gray-200">
            {draft.subject}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Body:</div>
          <div className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">
            {draft.body}
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-1">Why This Works:</div>
          <div className="text-xs text-gray-700">{draft.reasoning}</div>
        </div>
      </div>
    </div>
  );
};

// Rightsholder Form Component
const RightsholderForm = ({ rightsholder, onSave, onCancel }) => {
  const [formData, setFormData] = useState(rightsholder || {
    name: '',
    league: '',
    sport: '',
    territory: { primary: '', extended: '', reach: '' },
    differentiators: ['', '', ''],
    pitchAngles: ['', '', ''],
    targetCategories: [{ name: '', priority: 'medium', note: '' }],
    approach: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateDifferentiator = (index, value) => {
    const newDiff = [...formData.differentiators];
    newDiff[index] = value;
    setFormData({ ...formData, differentiators: newDiff });
  };

  const addDifferentiator = () => {
    setFormData({ ...formData, differentiators: [...formData.differentiators, ''] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {rightsholder ? 'Edit Rightsholder' : 'Add New Rightsholder'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Vancouver Canucks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">League*</label>
              <input
                type="text"
                required
                value={formData.league}
                onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., NHL, MLS, NBA"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport*</label>
            <input
              type="text"
              required
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Hockey, Soccer, Basketball"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Territory</label>
            <input
              type="text"
              value={formData.territory.primary}
              onChange={(e) => setFormData({ ...formData, territory: { ...formData.territory, primary: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Vancouver metro, Kansas City metro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extended Territory/Reach</label>
            <input
              type="text"
              value={formData.territory.extended}
              onChange={(e) => setFormData({ ...formData, territory: { ...formData.territory, extended: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Pacific Northwest region, 6-state system"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Differentiators*</label>
            {formData.differentiators.map((diff, index) => (
              <input
                key={index}
                type="text"
                value={diff}
                onChange={(e) => updateDifferentiator(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                placeholder={`Differentiator ${index + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={addDifferentiator}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Another Differentiator
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Approach</label>
            <textarea
              value={formData.approach}
              onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="2"
              placeholder="e.g., Fact-based value propositions, focus on ROI"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {rightsholder ? 'Update' : 'Add'} Rightsholder
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIEmailGenerator;
