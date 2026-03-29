import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'pending', 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed flex bg-background min-h-screen">
      
      {/* Sidebar Navigation Drawer */}
      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col h-screen w-72 fixed left-0 top-0 z-50 bg-white border-r border-outline-variant/10 py-4 shadow-none`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <h1 className="text-lg font-black text-blue-600 tracking-tighter">Atelier Expense</h1>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
            <img alt="User Profile Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm3PdofEu1RRBLe6PiFLEgXQfKpZHbhFG6IQgbKSi5aDIGw6zoGETpTIjracMwtIVL3tC1J0IppjAp5sS6Ljs4FoI8QkFQL8dc2vqFMXRMeJWpNAHWJJWzkMPF4XPuajTi3TzzQvK-K7S9n5DGRpLvbcRRm9ohfyXZYZKAKwnBgoCY8jOcp6BwA7SNk5VXO51NPZjJL6B5A_qkX6-qX_YhHUiy2TYlV-KEASw52Bmc422a-L1USPNkkFDo3BI__6cHKCAofJX-zNI"/>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Alex Morgan</p>
            <p className="text-xs text-on-surface-variant">Manager Role</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          <button 
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-3 px-4 py-2 mx-2 my-1 rounded-lg w-full text-left transition-all duration-200 ${activeTab === 'submit' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <span className="material-symbols-outlined text-[20px]">add_chart</span>
            <span className="text-sm font-medium">Submit Expense</span>
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-3 px-4 py-2 mx-2 my-1 rounded-lg w-full text-left transition-all duration-200 ${activeTab === 'pending' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <span className="material-symbols-outlined text-[20px]">rule_folder</span>
            <span className="text-sm font-medium">Pending Approvals</span>
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-3 px-4 py-2 mx-2 my-1 rounded-lg w-full text-left transition-all duration-200 ${activeTab === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
            <span className="text-sm font-medium">Admin Settings</span>
          </button>
        </nav>

        <div className="px-6 mt-auto">
          <div className="p-4 bg-surface-container-low rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">QUICK STAT</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">Finance Dept - Q3 Budget utilized 45%</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-72 flex-1 min-h-screen">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-bold tracking-tighter text-blue-600 font-sans antialiased">Atelier Expense</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined text-blue-600">account_circle</span>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-4 md:p-8 space-y-8 md:space-y-12">
          
          {activeTab === 'submit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Submit Expense Form */}
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-on-surface">Submit New Expense</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Efficient reimbursement processing for your daily operations.</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-outline">AMOUNT (INR)</label>
                      <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-2 py-3 text-lg font-medium transition-colors" placeholder="0.00" type="number"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-outline">DATE</label>
                      <input className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-2 py-3 text-lg font-medium transition-colors" type="date"/>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-outline">CATEGORY</label>
                    <select className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-2 py-3 text-sm font-medium transition-colors">
                      <option>Travel & Commute</option>
                      <option>Client Hospitality</option>
                      <option>Office Supplies</option>
                      <option>Subscription & Tools</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-outline">DESCRIPTION</label>
                    <textarea className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-2 py-3 text-sm transition-colors resize-none" placeholder="Brief details about this expense..." rows="2"></textarea>
                  </div>
                  
                  <div className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant rounded-xl hover:border-primary/50 transition-all bg-surface-container-low/50">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-3xl mb-2">cloud_upload</span>
                    <span className="text-xs font-medium text-on-surface-variant">Upload Receipt (PDF, PNG, JPG)</span>
                    <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file"/>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button className="primary-gradient text-on-primary px-10 py-3 rounded-md font-bold tracking-tight shadow-md hover:shadow-lg shadow-primary/20 active:scale-95 transition-all">
                      SUBMIT EXPENSE
                    </button>
                  </div>
                </form>
              </div>

              {/* My Recent Expenses */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xl font-bold tracking-tight">My Recent Expenses</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                  <div className="divide-y divide-outline-variant/5">
                    
                    <div className="p-5 flex items-center justify-between hover:bg-surface-container-low transition-all">
                      <div>
                        <p className="text-sm font-bold text-on-surface">Uber Fare - Office Commute</p>
                        <p className="text-[10px] text-outline mt-1">Oct 24, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold mb-1">₹ 450</p>
                        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-[#FEF3C7] text-[#D97706]">Pending</span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex items-center justify-between hover:bg-surface-container-low transition-all">
                      <div>
                        <p className="text-sm font-bold text-on-surface">Monthly Stationery Replenishment</p>
                        <p className="text-[10px] text-outline mt-1">Oct 20, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold mb-1">₹ 2,100</p>
                        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-[#DCFCE7] text-[#16A34A]">Approved</span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex items-center justify-between hover:bg-surface-container-low transition-all">
                      <div>
                        <p className="text-sm font-bold text-on-surface">Airport Premium Lounge Access</p>
                        <p className="text-[10px] text-outline mt-1">Oct 18, 2023</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold mb-1">₹ 1,800</p>
                        <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-[#FEE2E2] text-[#DC2626]">Rejected</span>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <section className="space-y-6 fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  Pending Approvals <span className="bg-[#DBEAFE] text-[#1D4ED8] text-xs px-2 py-0.5 rounded-full font-bold">12 New</span>
                </h3>
              </div>
              
              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#F1F5F9]">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Employee Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Description</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      
                      <tr className="hover:bg-[#F9FAFB] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">AM</div>
                            <p className="text-sm font-semibold text-[#111827]">Arjun Mehta</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-[#111827]">Client Dinner - Taj Mansingh</p>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">Sales Department</p>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-[#111827]">₹ 8,450</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all">APPROVE</button>
                            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[#DC2626] text-white hover:bg-red-700 transition-all">REJECT</button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="hover:bg-[#F9FAFB] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">PS</div>
                            <p className="text-sm font-semibold text-[#111827]">Priya Sharma</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-[#111827]">Round-trip Flight (BLR-DEL)</p>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">Product Team</p>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-[#111827]">₹ 14,200</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all">APPROVE</button>
                            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[#DC2626] text-white hover:bg-red-700 transition-all">REJECT</button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr className="hover:bg-[#F9FAFB] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">VS</div>
                            <p className="text-sm font-semibold text-[#111827]">Vikram Singh</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-[#111827]">Cloud Server Subscriptions</p>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">Engineering</p>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-[#111827]">₹ 32,500</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all">APPROVE</button>
                            <button className="px-4 py-1.5 rounded text-xs font-bold bg-[#DC2626] text-white hover:bg-red-700 transition-all">REJECT</button>
                          </div>
                        </td>
                      </tr>
                      
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-in">
              {/* Admin Analytics Overview */}
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-bold tracking-tight">Platform Overview</h3>
                  
                <div className="bg-[#2563EB] text-white rounded-2xl p-8 shadow-md shadow-blue-500/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">TOTAL DISBURSED</p>
                    <h4 className="text-4xl font-black mt-2 tracking-tight">₹ 4,82,900</h4>
                    <div className="mt-8 flex items-center gap-2 text-xs font-medium bg-white/20 w-fit px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      12% increase from last month
                    </div>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#E5E7EB] shadow-sm">
                    <span className="material-symbols-outlined text-[#D97706] mb-4 text-3xl">pending_actions</span>
                    <div>
                      <p className="text-3xl font-black text-[#111827]">24</p>
                      <p className="text-[11px] font-bold text-[#6B7280] mt-1 uppercase tracking-wider">Pending Requests</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#E5E7EB] shadow-sm">
                    <span className="material-symbols-outlined text-[#16A34A] mb-4 text-3xl">timer</span>
                    <div>
                      <p className="text-3xl font-black text-[#111827]">1.8d</p>
                      <p className="text-[11px] font-bold text-[#6B7280] mt-1 uppercase tracking-wider">Avg Process Time</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dense Audit Log */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold tracking-tight">System Audit Log</h3>
                <div className="bg-white rounded-2xl p-1 shadow-sm border border-[#E5E7EB] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F1F5F9] text-[#6B7280] text-[10px] font-bold uppercase tracking-widest border-b border-[#E5E7EB]">
                        <th className="px-5 py-4">Admin ID</th>
                        <th className="px-5 py-4">Action</th>
                        <th className="px-5 py-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#374151] font-medium divide-y divide-[#E5E7EB]">
                      <tr className="hover:bg-[#F9FAFB]">
                        <td className="px-5 py-4 font-bold text-[#111827]">ADM-092</td>
                        <td className="px-5 py-4">Policy Update: Travel Cap +10%</td>
                        <td className="px-5 py-4 text-right text-[10px] text-[#9CA3AF]">24 Oct, 11:20</td>
                      </tr>
                      <tr className="hover:bg-[#F9FAFB]">
                        <td className="px-5 py-4 font-bold text-[#111827]">ADM-104</td>
                        <td className="px-5 py-4">Role Assigned: Alex Morgan (Manager)</td>
                        <td className="px-5 py-4 text-right text-[10px] text-[#9CA3AF]">23 Oct, 16:45</td>
                      </tr>
                      <tr className="hover:bg-[#F9FAFB]">
                        <td className="px-5 py-4 font-bold text-[#111827]">ADM-092</td>
                        <td className="px-5 py-4">System Maintenance: Database Cleanup</td>
                        <td className="px-5 py-4 text-right text-[10px] text-[#9CA3AF]">22 Oct, 03:00</td>
                      </tr>
                      <tr className="hover:bg-[#F9FAFB]">
                        <td className="px-5 py-4 font-bold text-[#111827]">ADM-081</td>
                        <td className="px-5 py-4">New Employee Onboarded: 45 users</td>
                        <td className="px-5 py-4 text-right text-[10px] text-[#9CA3AF]">21 Oct, 09:12</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      
      {/* Floating Action Button (Mobile only) */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#2563EB] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1D4ED8] active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </button>

    </div>
  );
}

export default App;
