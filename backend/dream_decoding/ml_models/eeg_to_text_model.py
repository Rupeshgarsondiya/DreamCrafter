import torch
import torch.nn as nn
import torch.nn.functional as F

class EEGToTextModel(nn.Module):
    def __init__(self, input_channels=19, input_length=3000,
                 hidden_dim=128, vocab_size=5000, max_seq_len=20):
        super().__init__()
        self.max_seq_len = max_seq_len
        self.hidden_dim = hidden_dim
        self.vocab_size = vocab_size

        # EEG feature extractor (same as now) ...
        self.eeg_encoder = nn.Sequential(
            nn.Conv1d(input_channels, 32, kernel_size=7, stride=2, padding=3),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.MaxPool1d(3),
            nn.Conv1d(32, 64, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(3),
            nn.Conv1d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )

        # 🔥 Learnable token embeddings
        self.embedding = nn.Embedding(vocab_size, hidden_dim)

        # LSTM decoder
        self.text_decoder = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=2,
            dropout=0.3,
            batch_first=True
        )

        self.output_projection = nn.Linear(hidden_dim, vocab_size)

    def forward(self, eeg, target_length=20):
        features = self.eeg_encoder(eeg).squeeze(-1)   # [batch, 128]
        batch_size = features.size(0)

        # Initialize hidden states with EEG features
        h0 = features.unsqueeze(0).repeat(2, 1, 1)
        c0 = torch.zeros_like(h0)

        outputs = []
        input_token = torch.zeros(batch_size, 1, dtype=torch.long, device=eeg.device)  # <START>

        hidden = (h0, c0)
        for step in range(target_length):
            token_emb = self.embedding(input_token).squeeze(1)
            lstm_out, hidden = self.text_decoder(token_emb.unsqueeze(1), hidden)
            logits = self.output_projection(lstm_out.squeeze(1))
            outputs.append(logits.unsqueeze(1))
            input_token = logits.argmax(dim=-1, keepdim=True)

        return torch.cat(outputs, dim=1)  # [batch, seq_len, vocab_size]
