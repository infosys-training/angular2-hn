import SwiftUI

struct FooterView: View {
    var body: some View {
        VStack(spacing: 4) {
            Divider()
            
            HStack {
                Text("Built with SwiftUI")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                
                Text("•")
                    .foregroundColor(.secondary)
                
                Link("API by node-hnapi", destination: URL(string: "https://github.com/cheeaun/node-hnapi")!)
                    .font(.caption2)
                    .foregroundColor(.orange)
            }
            .padding(.vertical, 8)
        }
        .background(Color(.systemBackground))
    }
}

struct FooterView_Previews: PreviewProvider {
    static var previews: some View {
        FooterView()
    }
}
