package br.com.pepadata.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        try {
            WebView.setWebContentsDebuggingEnabled(true);
        } catch (Exception e) {
            System.out.println("Erro ao setar debug da webview");
        }
    }
}