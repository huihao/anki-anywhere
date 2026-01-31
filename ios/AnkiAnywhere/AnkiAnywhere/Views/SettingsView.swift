import SwiftUI

struct SettingsView: View {
    @State private var apiURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:3000/api"
    @State private var authToken = UserDefaults.standard.string(forKey: "authToken") ?? ""
    @State private var showingSaveAlert = false
    @State private var newCardsLimit = (UserDefaults.standard.object(forKey: "newCardsLimit") as? Int) ?? 20
    @State private var reviewCardsLimit = (UserDefaults.standard.object(forKey: "reviewCardsLimit") as? Int) ?? 100

    private let maxCardsLimit = 500
    
    var body: some View {
        Form {
            Section(header: Text("API设置")) {
                TextField("API地址", text: $apiURL)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                
                SecureField("访问令牌", text: $authToken)
            }
            
            Section(header: Text("学习上限")) {
                Stepper(value: $newCardsLimit, in: 0...maxCardsLimit) {
                    Text("新卡上限: \(newCardsLimit)")
                }
                Stepper(value: $reviewCardsLimit, in: 0...maxCardsLimit) {
                    Text("复习上限: \(reviewCardsLimit)")
                }
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
        UserDefaults.standard.set(newCardsLimit, forKey: "newCardsLimit")
        UserDefaults.standard.set(reviewCardsLimit, forKey: "reviewCardsLimit")
        showingSaveAlert = true
    }
}
