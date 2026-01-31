import SwiftUI

struct SettingsView: View {
    @State private var apiURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:3000/api"
    @State private var authToken = UserDefaults.standard.string(forKey: "authToken") ?? ""
    @State private var showingSaveAlert = false
    
    var body: some View {
        Form {
            Section(header: Text("API设置")) {
                TextField("API地址", text: $apiURL)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                SecureField("访问令牌", text: $authToken)
            }
            
            Section {
                Button(action: saveSettings) {
                    Text("保存设置")
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .navigationTitle("设置")
        .alert("设置已保存", isPresented: $showingSaveAlert) {
            Button("确定", role: .cancel) { }
        }
    }
    
    func saveSettings() {
        APIService.shared.setBaseURL(apiURL)
        APIService.shared.setAuthToken(authToken)
        showingSaveAlert = true
    }
}
